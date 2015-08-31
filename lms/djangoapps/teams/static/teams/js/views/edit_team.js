;(function (define) {
    'use strict';

    define(['backbone',
            'underscore',
            'gettext',
            'js/views/fields',
            'teams/js/models/team',
            'text!teams/templates/edit-team.underscore'],
        function (Backbone, _, gettext, FieldViews, TeamModel, editTeamTemplate) {
            return Backbone.View.extend({

                maxTeamNameLength: 255,
                maxTeamDescriptionLength: 300,

                events: {
                    'click .action-primary': 'createOrUpdateTeam',
                    'submit form': 'createOrUpdateTeam',
                    'click .action-cancel': 'cancelAndGoBack'
                },

                initialize: function(options) {
                    this.teamEvents = options.teamEvents;
                    this.courseID = options.teamParams.courseID;
                    this.topicID = options.teamParams.topicID;
                    this.collection = options.collection;
                    this.teamsUrl = options.teamParams.teamsUrl;
                    this.languages = options.teamParams.languages;
                    this.countries = options.teamParams.countries;
                    this.teamsDetailUrl = options.teamParams.teamsDetailUrl;
                    this.action = options.action;

                    _.bindAll(this, 'cancelAndGoBack', 'createOrUpdateTeam');

                    if (this.action === 'create') {
                        this.teamModel = new TeamModel({});
                        this.teamModel.url = this.teamsUrl;
                        this.primaryButtonTitle = gettext("Create");
                    } else if(this.action === 'edit' ) {
                        this.teamModel = options.model;
                        this.teamModel.url = this.teamsDetailUrl.replace('team_id', options.model.get('id')) + '?expand=user';
                        this.primaryButtonTitle = gettext("Update");
                    }

                    this.teamNameField = new FieldViews.TextFieldView({
                        model: this.teamModel,
                        title: gettext('Team Name (Required) *'),
                        valueAttribute: 'name',
                        helpMessage: gettext('A name that identifies your team (maximum 255 characters).')
                    });

                    this.teamDescriptionField = new FieldViews.TextareaFieldView({
                        model: this.teamModel,
                        title: gettext('Team Description (Required) *'),
                        valueAttribute: 'description',
                        editable: 'always',
                        showMessages: false,
                        helpMessage: gettext('A short description of the team to help other learners understand the goals or direction of the team (maximum 300 characters).')
                    });

                    this.teamLanguageField = new FieldViews.DropdownFieldView({
                        model: this.teamModel,
                        title: gettext('Language'),
                        valueAttribute: 'language',
                        required: false,
                        showMessages: false,
                        titleIconName: 'fa-comment-o',
                        options: this.languages,
                        helpMessage: gettext('The language that team members primarily use to communicate with each other.')
                    });

                    this.teamCountryField = new FieldViews.DropdownFieldView({
                        model: this.teamModel,
                        title: gettext('Country'),
                        valueAttribute: 'country',
                        required: false,
                        showMessages: false,
                        titleIconName: 'fa-globe',
                        options: this.countries,
                        helpMessage: gettext('The country that team members primarily identify with.')
                    });
                },

                render: function() {
                    this.$el.html(_.template(editTeamTemplate) ({
                        primaryButtonTitle: this.primaryButtonTitle,
                        action: this.action,
                        totalMembers: _.isUndefined(this.teamModel) ? 0 : this.teamModel.get('membership').length
                    }));
                    this.set(this.teamNameField, '.team-required-fields');
                    this.set(this.teamDescriptionField, '.team-required-fields');
                    this.set(this.teamLanguageField, '.team-optional-fields');
                    this.set(this.teamCountryField, '.team-optional-fields');
                    return this;
                },

                set: function(view, selector) {
                    var viewEl = view.$el;
                    if (this.$(selector).has(viewEl).length) {
                        view.render().setElement(viewEl);
                    } else {
                        this.$(selector).append(view.render().$el);
                    }
                },

                createOrUpdateTeam: function (event) {
                    event.preventDefault();
                    var view = this,
                        teamLanguage = this.teamLanguageField.fieldValue(),
                        teamCountry = this.teamCountryField.fieldValue(),
                        data = {
                            name: this.teamNameField.fieldValue(),
                            description: this.teamDescriptionField.fieldValue(),
                            language: _.isNull(teamLanguage) ? '' : teamLanguage,
                            country: _.isNull(teamCountry) ? '' : teamCountry
                        },
                        saveOptions = {
                            wait: true
                        };

                    if (this.action === 'create') {
                        data.course_id = this.courseID;
                        data.topic_id = this.topicID;
                    } else if (this.action === 'edit' ) {
                        saveOptions.patch = true;
                        saveOptions.contentType = 'application/merge-patch+json';
                    }

                    var validationResult = this.validateTeamData(data);
                    if (validationResult.status === false) {
                        this.showMessage(validationResult.message, validationResult.srMessage);
                        return;
                    }

                    this.teamModel.save(data, saveOptions)
                        .done(function(result) {
                            view.teamEvents.trigger('teams:update', {
                                action: view.action,
                                team: result
                            });
                            Backbone.history.navigate(
                                'teams/' + view.topicID + '/' + view.teamModel.id,
                                {trigger: true}
                            );
                        })
                        .fail(function(data) {
                            var response = JSON.parse(data.responseText);
                            var message = gettext("An error occurred. Please try again.");
                            if ('user_message' in response){
                                message = response.user_message;
                            }
                            view.showMessage(message, message);
                        });
                },

                validateTeamData: function (data) {
                    var status = true,
                        message = gettext('Check the highlighted fields below and try again.');
                    var srMessages = [];

                    this.teamNameField.unhighlightField();
                    this.teamDescriptionField.unhighlightField();

                    if (_.isEmpty(data.name.trim()) ) {
                        status = false;
                        this.teamNameField.highlightFieldOnError();
                        srMessages.push(
                            gettext('Enter team name.')
                        );
                    } else if (data.name.length > this.maxTeamNameLength) {
                        status = false;
                        this.teamNameField.highlightFieldOnError();
                        srMessages.push(
                            gettext('Team name cannot have more than 255 characters.')
                        );
                    }

                    if (_.isEmpty(data.description.trim()) ) {
                        status = false;
                        this.teamDescriptionField.highlightFieldOnError();
                        srMessages.push(
                            gettext('Enter team description.')
                        );
                    } else if (data.description.length > this.maxTeamDescriptionLength) {
                        status = false;
                        this.teamDescriptionField.highlightFieldOnError();
                        srMessages.push(
                            gettext('Team description cannot have more than 300 characters.')
                        );
                    }

                    return {
                        status: status,
                        message: message,
                        srMessage: srMessages.join(' ')
                    };
                },

                showMessage: function (message, screenReaderMessage) {
                    this.$('.wrapper-msg').removeClass('is-hidden');
                    this.$('.msg-content .copy p').text(_.escape(message));
                    this.$('.wrapper-msg').focus();

                    if (screenReaderMessage) {
                        this.$('.screen-reader-message').text(_.escape(screenReaderMessage));
                    }
                },

                cancelAndGoBack: function (event) {
                    event.preventDefault();
                    var url;
                    if (this.action === 'create') {
                        url = 'topics/' + this.topicID;
                    } else if (this.action === 'edit' ) {
                        url = 'teams/' + this.topicID + '/' + this.teamModel.get('id');
                    }
                    Backbone.history.navigate(url, {trigger: true});
                }
            });
        });
}).call(this, define || RequireJS.define);
