var app = null;
var map = null;
var map_markers = [];
var places = [{
    name: 'Taco Ocho',
    lat: 32.974799,
    lng: -96.709017
},{
    name: 'Olive Burger',
    lat: 32.960417,
    lng: -96.734356
},{
    name: 'Ye Ole Butcher Shop',
    lat: 33.020294,
    lng: -96.704346
},{
    name: 'El Pueblito',
    lat: 33.056949,
    lng: -96.710714
},{
    name: "Del's Charcoal Burgers",
    lat: 32.948137,
    lng: -96.731356
}];

function AppViewModel(){
    var self = this;

    this.places_list = ko.observableArray(places);

    this.selected_place = ko.observable(null);

    this.search = ko.observable('');

    // returns filtered list of places based on search observable
    this.filtered_places = function(){
        var query = new RegExp(self.search(), 'i');

        return places.filter(function(place){
            return place.name.search(query) >= 0;
        });
    };

    // update places_list based on filtered list
    this.search.subscribe(function(){
        self.places_list(self.filtered_places());
    });

    // animate Google Map Marker upon selection
    this.selected_place.subscribe(renderMarkers);

    // add Google Map Markers based on filtered list of places
    this.search.subscribe(renderMarkers);
 }

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 33.002564,lng: -96.708245},
        zoom: 11
    });

    // notify search subscribers to render map markers
    app.search.notifySubscribers();
}

function renderMarkers(){
    // do not do anything if the map has not been initialized
    if(!map){
        return;
    }

    // clear all existing map markers
    map_markers.forEach(function(marker){
        marker.setMap(null);
    });
    map_markers = [];

    // append markers for each filtered_place into map_markers
    var filtered_places = app.filtered_places();
    filtered_places.forEach(function(place){
        var animation = null;

        // add animation if place is selected
        if(place == app.selected_place()){
            animation = google.maps.Animation.BOUNCE;
        }

        var marker = new google.maps.Marker({
            position: {lat: place.lat, lng: place.lng},
            map: map,
            title: place.name,
            animation: animation
        });

        map_markers.push(marker);
    });
}

app = new AppViewModel();
ko.applyBindings(app);
