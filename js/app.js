var app = null;
var map = null;
var mapMarkers = [];
var infoWindow = null;
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
    this.selectedPlace.subscribe(selectMarker);

    // add Google Map Markers based on filtered list of places
    this.search.subscribe(filterMarkers);
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

function selectMarker(){
    // do not do anything if the map has not been initialized
    if(!map){
        return;
    }

    // close the current infoWindow if defined
    if(infoWindow){
        infoWindow.close();
    }

    mapMarkers.forEach(function(marker){
        // if selectedPlace is defined and it matches the marker..
        if(app.selectedPlace() && marker.title === app.selectedPlace().name){
            // set animation to BOUNCE
            marker.setAnimation(google.maps.Animation.BOUNCE);

            // also builds an info window to be displayed
            var place = app.selectedPlace();
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

            // build the infoWindow
            infoWindow = new google.maps.InfoWindow({
                content: html
            });

            // display the info window if it's defined
            infoWindow.open(map, marker);

            // deselect the place when closing the info window
            infoWindow.addListener('closeclick', function(){
                app.selectedPlace(null);
            });
        }
        else {
            // otherwise clear animation
            marker.setAnimation(null);
        }
    });
}

function filterMarkers(){
    // do not do anything if the map has not been initialized
    if(!map){
        return;
    }

    // get names for filtered places
    var filteredPlaces = [];
    app.filteredPlaces().forEach(function(place){
        filteredPlaces.push(place.name);
    });

    mapMarkers.forEach(function(marker){
        // hide marker if not in filteredPlaces
        if(filteredPlaces.indexOf(marker.title) < 0){
            marker.setVisible(false);
        }
        else {
            marker.setVisible(true);
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
