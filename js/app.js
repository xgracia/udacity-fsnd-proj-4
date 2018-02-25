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

    this.search.subscribe(function(){
        var query = new RegExp(self.search(), 'i');

        var filtered_places = places.filter(function(place){
            return place.name.search(query) >= 0;
        });

        self.places_list(filtered_places);
    });
 }

function initMap() {
    var map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 32.948333, lng: -96.729852},
        zoom: 11
    });
}

ko.applyBindings(new AppViewModel());
