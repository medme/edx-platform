;(function (define) {
    'use strict';
    define(['jquery', 'js/student_account/views/AccessView'],
        function($, AccessView) {

        var container = $('#login-and-registration-container');

        return function () {
            new AccessView({
                mode: container.data('initial-mode'),
                thirdPartyAuth: container.data('third-party-auth'),
                thirdPartyAuthHint: container.data('third-party-auth-hint'),
                nextUrl: container.data('next-url'),
                platformName: container.data('platform-name'),
                loginFormDesc: container.data('login-form-desc'),
                registrationFormDesc: container.data('registration-form-desc'),
                passwordResetFormDesc: container.data('password-reset-form-desc')
            });
        };
    });
}).call(this, define || RequireJS.define);
