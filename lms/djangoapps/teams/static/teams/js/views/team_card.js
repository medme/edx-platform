;(function (define) {
    'use strict';
    define([
        'backbone',
        'underscore',
        'gettext',
        'jquery.timeago',
        'js/components/card/views/card',
        'teams/js/views/team_utils',
        'text!teams/templates/team-country-language.underscore',
        'text!teams/templates/team-activity.underscore'
    ], function (Backbone, _, gettext, timeago, CardView, TeamUtils, teamCountryLanguageTemplate, teamActivityTemplate) {
        var TeamMembershipView, TeamCountryLanguageView, TeamActivityView, TeamCardView;

        TeamMembershipView = Backbone.View.extend({
            tagName: 'div',
            className: 'team-members',
            template: _.template(
                '<span class="member-count"><%= membership_message %></span>' +
                '<ul class="list-member-thumbs"></ul>'
            ),
            profileImageTemplate: _.template(
                '<li class="item-member-thumb"><img alt="<%- username %>" src="<%- profile_image_url %>"></img></li>'
            ),

            initialize: function (options) {
                this.maxTeamSize = options.maxTeamSize;
            },

            render: function () {
                var totalMemberships = this.model.get('membership'),
                    displayableMemberships = totalMemberships.slice(0, 5),
                    maxMemberCount = this.maxTeamSize;
                this.$el.html(this.template({
                    membership_message: TeamUtils.teamCapacityText(totalMemberships.length, maxMemberCount)
                }));
                // TODO: order by last active?
                _.each(displayableMemberships, function (membership)  {
                    this.$('.list-member-thumbs').append(
                        this.profileImageTemplate({
                            username: membership.user.username,
                            profile_image_url: membership.user.profile_image.image_url_small
                        })
                    );
                }, this);
                if (displayableMemberships.length < totalMemberships.length) {
                    this.$('.list-member-thumbs').append(
                        '<li class="item-member-thumb"><span class="icon fa-ellipsis-h"></span></li>'
                    )
                }

                return this;
            }
        });

        TeamCountryLanguageView = Backbone.View.extend({
            template: _.template(teamCountryLanguageTemplate),

            initialize: function (options) {
                this.countries = options.countries;
                this.languages = options.languages;
            },

            render: function() {
                // this.$el should be the card meta div
                this.$el.append(this.template({
                    country: this.countries[this.model.get('country')],
                    language: this.languages[this.model.get('language')]
                }));
            }
        });

        TeamActivityView = Backbone.View.extend({
            tagName: 'div',
            className: 'team-activity',
            template: _.template(teamActivityTemplate),

            initialize: function (options) {
                this.date = options.date;
            },

            render: function () {
                this.$el.html(
                    interpolate(
                        // Translators: 'date' is a placeholder for a fuzzy, relative timestamp (see: https://github.com/rmm5t/jquery-timeago)
                        gettext("Last Activity %(date)s"),
                        {date: this.template({date: this.date})},
                        true
                    )
                );
                this.$('abbr').timeago();
            }
        });

        TeamCardView = CardView.extend({
            initialize: function () {
                CardView.prototype.initialize.apply(this, arguments);
                // TODO: show last activity detail view
                this.detailViews = [
                    new TeamMembershipView({model: this.teamModel(), maxTeamSize: this.maxTeamSize}),
                    new TeamCountryLanguageView({
                        model: this.teamModel(),
                        countries: this.countries,
                        languages: this.languages
                    }),
                    new TeamActivityView({date: this.teamModel().get('last_activity_at')})
                ];
            },

            teamModel: function () {
                if (this.model.has('team')) { return this.model.get('team'); };
                return this.model;
            },

            configuration: 'list_card',
            cardClass: 'team-card',
            title: function () { return this.teamModel().get('name'); },
            description: function () { return this.teamModel().get('description'); },
            details: function () { return this.detailViews; },
            actionClass: 'action-view',
            actionContent: function() {
                return interpolate(
                    gettext('View %(span_start)s %(team_name)s %(span_end)s'),
                    {span_start: '<span class="sr">', team_name: this.teamModel().get('name'), span_end: '</span>'},
                    true
                );
            },
            actionUrl: function () {
                return '#teams/' + this.teamModel().get('topic_id') + '/' + this.teamModel().get('id');
            }
        });
        return TeamCardView;
    });
}).call(this, define || RequireJS.define);
