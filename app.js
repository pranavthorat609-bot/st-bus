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

// Initialize Database
const database = firebase.database();

console.log("Firebase connected!");
// Driver button click
document.getElementById("driverBtn").addEventListener("click", function () {

    if (navigator.geolocation) {

        navigator.geolocation.watchPosition(function (position) {

            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            const busData = {
                busNo: "MH12AB1234",
                route: "Pune - Mumbai",
                latitude: latitude,
                longitude: longitude,
                lastUpdated: Date.now()
            };

            database.ref("buses/bus1").set(busData);

            console.log("Location Updated:", latitude, longitude);

        }, function (error) {
            alert("Location access denied or error occurred.");
        }, {
            enableHighAccuracy: true
        });

        alert("Live Tracking Started!");

    } else {
        alert("Geolocation not supported in this browser.");
    }
});
// Passenger button click
document.getElementById("passengerBtn").addEventListener("click", function () {

    const busListDiv = document.getElementById("busList");
    busListDiv.innerHTML = "<h3>Active Buses:</h3>";

    database.ref("buses").on("value", function (snapshot) {

        busListDiv.innerHTML = "<h3>Active Buses:</h3>";

        snapshot.forEach(function (childSnapshot) {

            const bus = childSnapshot.val();
            const currentTime = Date.now();
const fourMinutes = 10 * 60 * 1000;

if (currentTime - bus.lastUpdated > fourMinutes) {
    database.ref("buses/" + childSnapshot.key).remove();
    return;
}

            // Create map first time
         if (!map) {

             map = L.map('map').setView([bus.latitude, bus.longitude], 13);

             L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
             attribution: '© OpenStreetMap contributors'
              }).addTo(map);

                marker = L.marker([bus.latitude, bus.longitude]).addTo(map);

                  } else {

    // Update marker position if location changes
    marker.setLatLng([bus.latitude, bus.longitude]);
    map.setView([bus.latitude, bus.longitude]);

}


            const busDiv = document.createElement("div");
            busDiv.style.border = "1px solid black";
            busDiv.style.padding = "10px";
            busDiv.style.margin = "10px";

            busDiv.innerHTML = `
                <strong>Bus No:</strong> ${bus.busNo} <br>
                <strong>Route:</strong> ${bus.route} <br>
                <strong>Latitude:</strong> ${bus.latitude} <br>
                <strong>Longitude:</strong> ${bus.longitude}
            `;

            busListDiv.appendChild(busDiv);

        });

    });

});

