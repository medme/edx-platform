/**
 * A search field that works in concert with a paginated collection. When the user
 * performs a search, the collection's search string will be updated and then the
 * collection will be refreshed to show the first page of results.
 */
;(function (define) {
    'use strict';

    define(['backbone', 'underscore', 'text!common/templates/components/search-field.underscore'],
        function (Backbone, _, searchFieldTemplate) {
            return Backbone.View.extend({

                events: {
                    'submit .search-form': 'performSearch'
                },

                initialize: function(options) {
                    Backbone.View.prototype.initialize.call(this, options);
                    this.type = options.type;
                    _.bindAll(this, 'performSearch');
                },

                render: function() {
                    this.$el.html(_.template(searchFieldTemplate, {
                        type: this.type,
                        searchString: this.collection ? this.collection.searchString : '',
                        searchLabel: gettext('Search teams')
                    }));
                    return this;
                },

                performSearch: function(event) {
                    var searchField = this.$('.search-field'),
                        searchString = $.trim(searchField.val());
                    event.preventDefault();
                    if (this.collection) {
                        this.collection.setSearchString(searchString);
                        this.collection.setPage(1);
                    }
                }
            });
        });
}).call(this, define || RequireJS.define);
