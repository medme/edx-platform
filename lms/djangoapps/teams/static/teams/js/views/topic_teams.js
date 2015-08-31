;(function (define) {
    'use strict';
    define([
        'backbone',
        'gettext',
        'teams/js/views/teams',
        'common/js/components/views/paging_header',
        'text!teams/templates/team-actions.underscore'
    ], function (Backbone, gettext, TeamsView, PagingHeader, teamActionsTemplate) {
            var TopicTeamsView = TeamsView.extend({
                events: {
                    'click a.browse-teams': 'browseTeams',
                    'click a.search-teams': 'searchTeams',
                    'click a.create-team': 'showCreateTeamForm'
                },

                initialize: function(options) {
                    this.showSortControls = options.showSortControls;
                    TeamsView.prototype.initialize.call(this, options);
                    _.bindAll(this, 'browseTeams', 'searchTeams', 'showCreateTeamForm');
                },

                render: function() {
                    var self = this;
                    $.when(
                        this.collection.refresh(),
                        this.teamMemberships.refresh()
                    ).done(function() {
                            TeamsView.prototype.render.call(self);

                            if (self.teamMemberships.canUserCreateTeam()) {
                                var message = interpolate_text(
                                    _.escape(gettext("{browse_span_start}Browse teams in other topics{span_end} or {search_span_start}search team descriptions{span_end} in this topic. If you still can't find a team to join, {create_span_start}create a new team in this topic{span_end}.")),
                                    {
                                        'browse_span_start': '<a class="browse-teams" href="">',
                                        'search_span_start': '<a class="search-teams" href="">',
                                        'create_span_start': '<a class="create-team" href="">',
                                        'span_end': '</a>'
                                    }
                                );
                                self.$el.append(_.template(teamActionsTemplate, {message: message}));
                            }
                        });
                    return this;
                },

                browseTeams: function (event) {
                    event.preventDefault();
                    Backbone.history.navigate('browse', {trigger: true});
                },

                searchTeams: function (event) {
                    event.preventDefault();
                    $('.page-header-search .search-field').focus();
                    $('html, body').animate({
                        scrollTop: 0
                    }, 500);
                },

                showCreateTeamForm: function (event) {
                    event.preventDefault();
                    Backbone.history.navigate('topics/' + this.model.id + '/create-team', {trigger: true});
                },

                createHeaderView: function () {
                    return new PagingHeader({
                        collection: this.options.collection,
                        srInfo: this.srInfo,
                        showSortControls: this.showSortControls
                    });
                }
            });

            return TopicTeamsView;
        });
}).call(this, define || RequireJS.define);
