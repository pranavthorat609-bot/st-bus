// Your Firebase configuration
let map;
let marker;

const firebaseConfig = {
  apiKey: "AIzaSyCvOAxFK0TXjdasM3nFX-3-PXtr48pgJgw",
  authDomain: "msrtc-bus-tracking-74767.firebaseapp.com",
  databaseURL: "https://msrtc-bus-tracking-74767-default-rtdb.asia-southeast1.firebasedatabase.app",

  projectId: "msrtc-bus-tracking-74767",
  storageBucket: "msrtc-bus-tracking-74767.firebasestorage.app",
  messagingSenderId: "260023567503",
  appId: "PASTE_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
let watchId = null;
let currentBusRef = null;
let selectedBusId = null;



// Initialize Database
const database = firebase.database();

console.log("Firebase connected!");
// Driver button click
document.getElementById("driverBtn").addEventListener("click", () => {
    document.getElementById("driverSection").style.display = "block";
});
document.getElementById("startTracking").addEventListener("click", () => {

    const busNo = document.getElementById("busNo").value;
    const route = document.getElementById("route").value;

    if (busNo === "" || route === "") {
        alert("Please enter Bus Number and select Route");
        return;
    }

    if (!navigator.geolocation) {
        alert("Geolocation not supported");
        return;
    }

    // TEMP bus reference (Step 2 will improve this)
currentBusRef = database.ref("buses").push();

document.getElementById("startTracking").addEventListener("click", () => {

    const busNo = document.getElementById("busNo").value;
    const route = document.getElementById("route").value;

    if (busNo === "" || route === "") {
        alert("Please enter Bus Number and select Route");
        return;
    }

    if (!navigator.geolocation) {
        alert("Geolocation not supported");
        return;
    }

    // 🔥 CREATE UNIQUE BUS ENTRY
    currentBusRef = database.ref("buses").push();

    watchId = navigator.geolocation.watchPosition(
        (position) => {

            const busData = {
                busNo: busNo,
                route: route,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                lastUpdated: Date.now()
            };

            currentBusRef.set(busData);

            document.getElementById("driverStatus").innerText =
                "Tracking live location...";
        },
        () => {
            alert("Location permission denied");
        },
        { enableHighAccuracy: true }
    );

    document.getElementById("startTracking").style.display = "none";
    document.getElementById("stopTracking").style.display = "inline";
});

   
});
document.getElementById("stopTracking").addEventListener("click", () => {

    if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
    }

    if (currentBusRef) {
        currentBusRef.remove();
    }

    document.getElementById("driverStatus").innerText =
        "Tracking stopped";

    document.getElementById("startTracking").style.display = "inline";
    document.getElementById("stopTracking").style.display = "none";
});


// // Passenger button click
document.getElementById("passengerBtn").addEventListener("click", () => {

    const busListDiv = document.getElementById("busList");
    busListDiv.innerHTML = "<h3>Active Buses (Click one):</h3>";

    database.ref("buses").on("value", (snapshot) => {

        busListDiv.innerHTML = "<h3>Active Buses (Click one):</h3>";

        snapshot.forEach((childSnapshot) => {

            const bus = childSnapshot.val();
            const busId = childSnapshot.key;
            // 🔥 STEP 3C: Handle selected bus removal
if (selectedBusId && !snapshot.hasChild(selectedBusId)) {

    selectedBusId = null;

    if (marker) {
        marker.remove();
        marker = null;
    }

    if (map) {
        map.remove();
        map = null;
    }

    document.getElementById("map").style.display = "none";

    alert("Selected bus is no longer active");
}

            // 🔥 AUTO REMOVE BUS AFTER 4 MINUTES
const currentTime = Date.now();
const fourMinutes = 4 * 60 * 1000;

if (currentTime - bus.lastUpdated > fourMinutes) {
    database.ref("buses/" + busId).remove();
    return; // stop processing this bus
}
// 🔥 STEP 3B: Update map ONLY for selected bus
if (selectedBusId && busId === selectedBusId) {
    if (map && marker) {
        marker.setLatLng([bus.latitude, bus.longitude]);
        map.setView([bus.latitude, bus.longitude]);
    }
}


            // Create clickable bus card
            const busDiv = document.createElement("div");
            busDiv.style.border = "1px solid black";
            busDiv.style.padding = "10px";
            busDiv.style.margin = "10px";
            busDiv.style.cursor = "pointer";

            busDiv.innerHTML = `
                <strong>Bus No:</strong> ${bus.busNo}<br>
                <strong>Route:</strong> ${bus.route}
            `;

            // 👉 CLICK HANDLER (IMPORTANT)
           busDiv.addEventListener("click", () => {
    selectedBusId = childSnapshot.key;

    const mapDiv = document.getElementById("map");
    mapDiv.style.display = "block";

    // ✅ CREATE MAP ONLY ONCE
    selectedBusId = busId;

document.getElementById("map").style.display = "block";

if (!map) {
    map = L.map('map').setView([bus.latitude, bus.longitude], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    marker = L.marker([bus.latitude, bus.longitude]).addTo(map);
} else {
    marker.setLatLng([bus.latitude, bus.longitude]);
    map.setView([bus.latitude, bus.longitude]);
}

    alert("Selected Bus: " + bus.busNo);
});


            busListDiv.appendChild(busDiv);
        });
    });
});


