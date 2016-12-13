/* QUICK LINKS
 This js file runs the functionality of the Quick Links module. Each visitor to a site is unique.
 This module can be used to display a set of links based on the pages of a site the user visits the most. If
 the user is new the site, a predefined default set of links will be used.
*/

Drupal.behaviors.quickLinks = {
    attach: function(context, settings) {

        // Initalizes the necessary functions to start the Quick Links functionality.
        function quickLinksInit() {
            var quickLinks = document.getElementById( 'quicklinks' );
            var processedClass = 'quicklinks-processed';

            if ( !quickLinks.classList.contains( processedClass ) ) {

                if ( quickLinks.classList ) {
                    quickLinks.classList.add( processedClass );
                } else {
                    quickLinks.className += ' ' + processedClass;
                }

                // Store the current page visit
                storePageVisit();

                // Populate the quick links markup if we should.
                if (shouldPopulateQL()) {
                    populateQLBlock( quickLinks );
                }
            }
        }

        // Retrieves all logged pages and number of visits from local storage.
        function getAllPageVisits() {
            if ( localStorage.getItem( 'Page Visits' ) ) {
                // Grabs data from local storage and parses it to be a readable object rather than string.
                return JSON.parse(localStorage.getItem('Page Visits'));
            } else {
                // Return empty object
                return {};
            }
        }

        //Removes trailing forward slash from the current pages path alias if there is one.
        function stripTrailingSlash( str ) {
            if( str.substr( -1 ) === '/' ) {
                return str.substr( 0, str.length - 1 );
            }
            return str;
        }

        // Stores the updated list of pages and amount of page visits on the users local storage.
        function storePageVisit() {
            var pageVisits = getAllPageVisits();
            var ignoredPages = getIgnoredPages();
            var currentPage = stripTrailingSlash( window.location.pathname );

            if ( ignoredPages.indexOf(currentPage) == -1 ) {
                incrementVisit( pageVisits );
                // Stores object on local storage after converting it to a string.
                // Note: localStorage can only store string data.
                localStorage.setItem( 'Page Visits', JSON.stringify( pageVisits ) );
            }
        }

        // Returns an array of urls of pages to not store in local storage when visited.
        // Example: Homepage('/' or 'example.com/').
        function getIgnoredPages() {
            return [
                '',
                '/',
                '/homepage',
                '/node',
                '/news',
                '/user/login'
            ];
        }

        // Adds or updates page visit data.
        function incrementVisit( pageVisits ) {
            var currentPage = stripTrailingSlash( window.location.pathname );
            var pageTitle = document.title;

            if ( pageVisits[currentPage] ) {
                // Adds page visits as well as updates page title in case it changed.
                pageVisits[currentPage].title = pageTitle;
                pageVisits[currentPage].visits++;
            } else {
                // Creates new object within the page list object for a new page visit.
                pageVisits[currentPage] = { url: currentPage, title: pageTitle, visits: 1 };
            }
        }

        // Sorts the pages according to the number of visits they have from the most to the least.
        // This makes it easier later on when we want to pull in only the top results without having to loop through and evaluate the whole object.
        function sortVisits( pageVisits ) {
            var arrayOfPageVisits = convertObjectToArray(pageVisits);

            arrayOfPageVisits.sort( function( a, b ) {
                return b.visits - a.visits;
            });

            return arrayOfPageVisits;
        }

        // Converts the object of objects to an array of objects.
        // This allows us to take advantage of methods and properties of arrays that objects do not have.
        // Example: array.length or array.sort
        // Note: This conversion does get rid of the keys or names for each object in the new array. As a result, it is only used when the keys or 'names' of the objects are not needed.
        function convertObjectToArray( objectToConvert ) {
            var convertedObject = [];
            for ( var item in objectToConvert ) {
                convertedObject.push( objectToConvert[item] );
            }

            return convertedObject;
        }

        // Checks to see if the users site visit data meets the minimum requirements deciding whether or not to repopulate the Quick Links block with the custom links.
        function shouldPopulateQL() {
            var pageVisits = getAllPageVisits();

            function add(a, b) {
                return a + pageVisits[b].visits;
            }
            var minimumPageAmount = 3;
            var minimumPageVisits = 12;
            var totalPageVisits = Object.keys( pageVisits ).reduce( add, 0 );

            return !!(Object.keys(pageVisits).length >= minimumPageAmount && totalPageVisits >= minimumPageVisits);

        }

        // Changes the default Quick Links block links to the custom links.
        function populateQLBlock( quickLinks ) {
            var pageVisits = getAllPageVisits();

            var sortedPageVisits = sortVisits( pageVisits );
            var maxLinkCapacity = 5;

            // Updates array to include ONLY the top visited pages. Number of items in updated array is based on the maxLinkCapacity variable.
            sortedPageVisits.splice( maxLinkCapacity, sortedPageVisits.length - maxLinkCapacity );

            // Removes old links and outputs new links to the page.
            var oldUl = quickLinks.querySelector( 'ul' )
            quickLinks.removeChild( oldUl );

            var ul = document.createElement( 'ul' );
            var quickLinksUl = quickLinks.appendChild( ul );

            for ( var page = 0; page < sortedPageVisits.length; page++ ) {
                var menuItem = document.createElement( 'li' ); // document.getElementById( '' );
                menuItem.innerHTML = '<a href=\'' + sortedPageVisits[page].url + '\'>' + sortedPageVisits[page].title.replace(" | ", "") + '</a>';
                quickLinksUl.appendChild( menuItem );
            }
        }

        // Begins the Quick Links module functionality.
        quickLinksInit();

    }
};

