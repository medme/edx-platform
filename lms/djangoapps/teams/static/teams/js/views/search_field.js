;(function (define) {
    'use strict';

    define(['backbone', 'underscore', 'text!teams/templates/search-field.underscore'],
        function (Backbone, _, searchFieldTemplate) {
            return Backbone.View.extend({

                events: {
                    'submit .teams-search-form': 'performSearch',
                    'click .cancel-button': 'clearSearch'
                },

                initialize: function(options) {
                    Backbone.View.prototype.initialize.call(this, options);
                    _.bindAll(this, 'performSearch', 'clearSearch');
                },

                render: function() {
                    this.$el.html(_.template(searchFieldTemplate, {
                        searchString: this.collection.searchString,
                        searchLabel: gettext('Search teams')
                    }));
                    return this;
                },

                performSearch: function(event) {
                    var searchField = this.$('.search-field'),
                        searchString = $.trim(searchField.val());
                    event.preventDefault();
                    this.collection.setSearchString(searchString);
                    this.collection.setPage(1);
                },

                clearSearch: function(event) {
                    var searchField = this.$('.search-field');
                    event.preventDefault();
                    searchField.val('');
                    this.collection.setSearchString('');
                    this.collection.setPage(1);
                }
            });
        });
}).call(this, define || RequireJS.define);
