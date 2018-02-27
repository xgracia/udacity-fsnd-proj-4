var app = null;
var map = null;
var mapMarkers = [];
var places = [{
    name: 'Taco Ocho',
    yelpId: 'taco-ocho-richardson',
    yelpData: null,
    lat: 32.974799,
    lng: -96.709017
},{
    name: 'Olive Burger',
    yelpId: 'olive-burger-richardson-richardson',
    yelpData: null,
    lat: 32.960417,
    lng: -96.734356
},{
    name: 'Ye Ole Butcher Shop',
    yelpId: 'ye-ole-butcher-shop-plano',
    yelpData: null,
    lat: 33.020294,
    lng: -96.704346
},{
    name: 'El Pueblito',
    yelpId: 'el-pueblito-mexican-cocina-plano',
    yelpData: null,
    lat: 33.056949,
    lng: -96.710714
},{
    name: "Del's Charcoal Burgers",
    yelpId: 'dels-charcoal-burgers-richardson',
    yelpData: null,
    lat: 32.948137,
    lng: -96.731356
}];

function AppViewModel(){
    var self = this;

    this.placesList = ko.observableArray(places);

    this.selectedPlace = ko.observable(null);

    this.search = ko.observable('');

    // returns filtered list of places based on search observable
    this.filteredPlaces = function(){
        var query = new RegExp(self.search(), 'i');

        return places.filter(function(place){
            return place.name.search(query) >= 0;
        });
    };

    // update placesList based on filtered list
    // also clears selected place if not in filtered list
    this.search.subscribe(function(){
        var filteredPlaces = self.filteredPlaces();
        var selectedPlace = self.selectedPlace();

        self.placesList(filteredPlaces);

        if(filteredPlaces.indexOf(selectedPlace) < 0){
            self.selectedPlace(null);
        }
    });

    // animate Google Map Marker upon selection
    this.selectedPlace.subscribe(renderMarkers);

    // add Google Map Markers based on filtered list of places
    this.search.subscribe(renderMarkers);
 }

function initMap() {
    // initialize map
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 33.002564,lng: -96.708245},
        zoom: 11
    });

    // initialize all markers
    places.forEach(function(place){
        var marker = new google.maps.Marker({
            position: {lat: place.lat, lng: place.lng},
            map: map,
            title: place.name
        });

        // Update selectedPlace when a marker is clicked
        marker.addListener('click', function(){
            app.selectedPlace(place);
        });

        mapMarkers.push(marker);
    });
}

function mapFailure() {
    var elem = document.getElementById('map');
    var html = '<div class="alert alert-danger">Error loading Google Maps API</div>' + elem.innerHTML;

    elem.innerHTML = html;
}

function renderMarkers(){
    // do not do anything if the map has not been initialized
    if(!map){
        return;
    }

    // clear all existing map markers
    mapMarkers.forEach(function(marker){
        marker.setMap(null);
    });
    mapMarkers = [];

    // append markers for each filtered_place into mapMarkers
    var filteredPlaces = app.filteredPlaces();
    filteredPlaces.forEach(function(place){
        var animation = null;
        var infoWindow = null;

        // add animation if place is selected
        // also builds an info window to be displayed
        if(place == app.selectedPlace()){
            animation = google.maps.Animation.BOUNCE;

            var html = '<h5>' + place.name + '</h5>';
            // if yelp data hasn't loaded yet, link the yelp page
            if(place.yelpData === null){
                html += '<p>Still retrieving Yelp Data. Please try again soon or visit: ' +
                    '<a href="https://www.yelp.com/biz/' + place.yelpId + '">Its Yelp Page</a>' +
                    '</p>';
            }
            // if something went wrong w/ the yelp request, link to the yelp page
            else if(place.yelpData.error){
                html += '<p>Error retrieving Yelp Data. Please visit: ' +
                    '<a href="https://www.yelp.com/biz/' + place.yelpId + '">Its Yelp Page</a>' +
                    '</p>';
            }
            // if all went right, show rating and review counts
            else{
                html += '<p>Rating: ' + place.yelpData.rating + '</p>' +
                    '<p>Reviews: ' + place.yelpData.review_count + '</p>' +
                    '<p><a href="https://www.yelp.com/biz/' + place.yelpId + '">Its Yelp Page</a></p>';
            }

            infoWindow = new google.maps.InfoWindow({
                content: html
            });
        }

        var marker = new google.maps.Marker({
            position: {lat: place.lat, lng: place.lng},
            map: map,
            title: place.name,
            animation: animation
        });

        // Update selectedPlace when a marker is clicked
        marker.addListener('click', function(){
            app.selectedPlace(place);
        });

        mapMarkers.push(marker);

        // display the info window if it's defined
        if(infoWindow !== null){
            infoWindow.open(map, marker);

            // deselect the place when closing the info window
            infoWindow.addListener('closeclick', function(){
                infoWindow.marker = null;
                app.selectedPlace(null);
            });
        }
    });
}

// function gets Yelp data for all places
function getYelpData(){
    places.forEach(function(place){
        $.getJSON('https://udacity-fsnd-proj4.my.to/yelp_data/' + place.yelpId, function(data){
            place.yelpData = data;
        }).fail(function(){
            place.yelpData = {error: true};
        });
    });
}

app = new AppViewModel();
ko.applyBindings(app);

// only run when DOM is ready
$(function(){
    getYelpData();
});
