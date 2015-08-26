;(function (define) {
    'use strict';

    define(['backbone', 'underscore', 'text!teams/templates/search-field.underscore'],
        function (Backbone, _, searchFieldTemplate) {
            return Backbone.View.extend({

                events: {
                    'submit .teams-search-form': 'performSearch',
                    'keyup .search-field': 'refreshState',
                    'click .cancel-button': 'clearSearch'
                },

                initialize: function(options) {
                    this.collection = options.collection;
                    _.bindAll(this, 'performSearch', 'clearSearch');
                },

                refreshState: function() {
                    var searchField = this.$('.search-field'),
                        searchString = $.trim(searchField.val());
                    if (searchString) {
                        searchField.addClass('is-active');
                        this.$('.cancel-button').show();
                    } else {
                        searchField.removeClass('is-active');
                        this.$('.cancel-button').hide();
                    }
                },

                render: function() {
                    this.$el.html(_.template(searchFieldTemplate, {
                        searchString: this.collection.searchString
                    }));
                    this.refreshState();
                    return this;
                },

                performSearch: function(event) {
                    var searchField = this.$('.search-field'),
                        searchString = $.trim(searchField.val());
                    event.preventDefault();
                    this.refreshState();
                    this.collection.setSearchString(searchString);
                    this.collection.setPage(1);
                },

                clearSearch: function(event) {
                    var searchField = this.$('.search-field');
                    event.preventDefault();
                    searchField.val('');
                    this.collection.setSearchString('');
                    this.refreshState();
                    this.collection.setPage(1);
                }
            });
        });
}).call(this, define || RequireJS.define);
