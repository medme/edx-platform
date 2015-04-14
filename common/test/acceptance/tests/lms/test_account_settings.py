# -*- coding: utf-8 -*-
"""
End-to-end tests for the Account Settings page.
"""
from unittest import skip

from bok_choy.web_app_test import WebAppTest

from ...pages.lms.account_settings import AccountSettingsPage
from ...pages.lms.auto_auth import AutoAuthPage
from ...pages.lms.dashboard import DashboardPage

from ..helpers import EventsTestMixin


class AccountSettingsTestMixin(EventsTestMixin, WebAppTest):
    """
    Mixin with helper methods to test the account settings page.
    """

    USERNAME = "test"
    PASSWORD = "testpass"
    EMAIL = u"test@example.com"
    CHANGE_INITIATED_EVENT_NAME = u"edx.user.settings.change_initiated"
    ACCOUNT_SETTINGS_REFERER = u"/account/settings"

    def setUp(self):
        """
        Initialize account and pages.
        """
        super(AccountSettingsTestMixin, self).setUp()

        self.user_id = AutoAuthPage(
            self.browser, username=self.USERNAME, password=self.PASSWORD, email=self.EMAIL
        ).visit().get_user_id()


class DashboardMenuTest(AccountSettingsTestMixin, WebAppTest):
    """
    Tests that the dashboard menu works correctly with the account settings page.
    """
    def test_link_on_dashboard_works(self):
        """
        Scenario: Verify that the "Account Settings" link works from the dashboard.


        Given that I am a registered user
        And I visit my dashboard
        And I click on "Account Settings" in the top drop down
        Then I should see my account settings page
        """
        dashboard_page = DashboardPage(self.browser)
        dashboard_page.visit()
        dashboard_page.click_username_dropdown()
        self.assertIn('Account Settings', dashboard_page.username_dropdown_link_text)
        dashboard_page.click_account_settings_link()


class AccountSettingsPageTest(AccountSettingsTestMixin, WebAppTest):
    """
    Tests that verify behaviour of the Account Settings page.
    """
    SUCCESS_MESSAGE = 'Your changes have been saved.'

    def setUp(self):
        """
        Initialize account and pages.
        """
        super(AccountSettingsPageTest, self).setUp()

        # Visit the account settings page for the current user.
        self.account_settings_page = AccountSettingsPage(self.browser)
        self.account_settings_page.visit()

    def test_page_view_event(self):
        """
        Scenario: An event should be recorded when the "Account Settings"
           page is viewed.

        Given that I am a registered user
        And I visit my account settings page
        Then a page view analytics event should be recorded
        """
        self.verify_events_of_type(
            u"edx.user.settings.viewed",
            [{
                u"user_id": int(self.user_id),
                u"page": u"account",
                u"visibility": None,
            }]
        )

    def test_all_sections_and_fields_are_present(self):
        """
        Scenario: Verify that all sections and fields are present on the page.
        """
        expected_sections_structure = [
            {
                'title': 'Basic Account Information (required)',
                'fields': [
                    'Username',
                    'Full Name',
                    'Email Address',
                    'Password',
                    'Language',
                    'Country or Region'
                ]
            },
            {
                'title': 'Additional Information (optional)',
                'fields': [
                    'Education Completed',
                    'Gender',
                    'Year of Birth',
                    'Preferred Language',
                ]
            },
            {
                'title': 'Connected Accounts',
                'fields': [
                    'Facebook',
                    'Google',
                ]
            }
        ]

        self.assertEqual(self.account_settings_page.sections_structure(), expected_sections_structure)

    def _test_readonly_field(self, field_id, title, value):
        """
        Test behavior of a readonly field.
        """
        self.assertEqual(self.account_settings_page.title_for_field(field_id), title)
        self.assertEqual(self.account_settings_page.value_for_readonly_field(field_id), value)

    def _test_text_field(
            self, field_id, title, initial_value, new_invalid_value, new_valid_values, success_message=SUCCESS_MESSAGE,
            assert_after_reload=True
    ):
        """
        Test behaviour of a text field.
        """
        self.assertEqual(self.account_settings_page.title_for_field(field_id), title)
        self.assertEqual(self.account_settings_page.value_for_text_field(field_id), initial_value)

        self.assertEqual(
            self.account_settings_page.value_for_text_field(field_id, new_invalid_value), new_invalid_value
        )
        self.account_settings_page.wait_for_indicator(field_id, 'validation-error')
        self.browser.refresh()
        self.assertNotEqual(self.account_settings_page.value_for_text_field(field_id), new_invalid_value)

        for new_value in new_valid_values:
            self.assertEqual(self.account_settings_page.value_for_text_field(field_id, new_value), new_value)
            self.account_settings_page.wait_for_messsage(field_id, success_message)
            if assert_after_reload:
                self.browser.refresh()
                self.assertEqual(self.account_settings_page.value_for_text_field(field_id), new_value)

    def _test_dropdown_field(
            self, field_id, title, initial_value, new_values, success_message=SUCCESS_MESSAGE, reloads_on_save=False
    ):
        """
        Test behaviour of a dropdown field.
        """
        self.assertEqual(self.account_settings_page.title_for_field(field_id), title)
        self.assertEqual(self.account_settings_page.value_for_dropdown_field(field_id), initial_value)

        for new_value in new_values:
            self.assertEqual(self.account_settings_page.value_for_dropdown_field(field_id, new_value), new_value)
            self.account_settings_page.wait_for_messsage(field_id, success_message)
            if reloads_on_save:
                self.account_settings_page.wait_for_loading_indicator()
            else:
                self.browser.refresh()
            self.assertEqual(self.account_settings_page.value_for_dropdown_field(field_id), new_value)

    def _test_link_field(self, field_id, title, link_title, success_message):
        """
        Test behaviour a link field.
        """
        self.assertEqual(self.account_settings_page.title_for_field(field_id), title)
        self.assertEqual(self.account_settings_page.link_title_for_link_field(field_id), link_title)
        self.account_settings_page.click_on_link_in_link_field(field_id)
        self.account_settings_page.wait_for_messsage(field_id, success_message)

    def test_username_field(self):
        """
        Test behaviour of "Username" field.
        """
        self._test_readonly_field(
            'username',
            'Username',
            self.USERNAME,
        )

    def test_full_name_field(self):
        """
        Test behaviour of "Full Name" field.
        """
        self._test_text_field(
            u'name',
            u'Full Name',
            self.USERNAME,
            u'@',
            [u'another name', self.USERNAME],
        )

    def test_email_field(self):
        """
        Test behaviour of "Email" field.
        """
        self._test_text_field(
            u'email',
            u'Email Address',
            self.EMAIL,
            u'@',
            [u'me@here.com', u'you@there.com'],
            success_message='Click the link in the message to update your email address.',
            assert_after_reload=False
        )

        self.verify_events_of_type(
            self.CHANGE_INITIATED_EVENT_NAME,
            [
                {
                    u"user_id": int(self.user_id),
                    u"setting": u"email",
                    u"old": self.EMAIL,
                    u"new": u'me@here.com'
                },
                {
                    u"user_id": int(self.user_id),
                    u"setting": u"email",
                    u"old": self.EMAIL,  # NOTE the first email change was never confirmed, so old has not changed.
                    u"new": u'you@there.com'
                }
            ],
            [self.ACCOUNT_SETTINGS_REFERER, self.ACCOUNT_SETTINGS_REFERER]
        )

    def test_password_field(self):
        """
        Test behaviour of "Password" field.
        """
        self._test_link_field(
            u'password',
            u'Password',
            u'Reset Password',
            success_message='Click the link in the message to reset your password.',
        )

        self.verify_events_of_type(
            self.CHANGE_INITIATED_EVENT_NAME,
            [{
                u"user_id": int(self.user_id),
                u"setting": "password",
                u"old": None,
                u"new": None
            }],
            [self.ACCOUNT_SETTINGS_REFERER]
        )

    @skip(
        'On bokchoy test servers, language changes take a few reloads to fully realize '
        'which means we can no longer reliably match the strings in the html in other tests.'
    )
    def test_language_field(self):
        """
        Test behaviour of "Language" field.
        """
        self._test_dropdown_field(
            u'pref-lang',
            u'Language',
            u'English',
            [u'Dummy Language (Esperanto)', u'English'],
            reloads_on_save=True,
        )

    def test_education_completed_field(self):
        """
        Test behaviour of "Education Completed" field.
        """
        self._test_dropdown_field(
            u'level_of_education',
            u'Education Completed',
            u'',
            [u'Bachelor\'s degree', u''],
        )

    def test_gender_field(self):
        """
        Test behaviour of "Gender" field.
        """
        self._test_dropdown_field(
            u'gender',
            u'Gender',
            u'',
            [u'Female', u''],
        )

    def test_year_of_birth_field(self):
        """
        Test behaviour of "Year of Birth" field.
        """
        self.assertEqual(self.account_settings_page.value_for_dropdown_field('year_of_birth', ''), '')
        self._test_dropdown_field(
            u'year_of_birth',
            u'Year of Birth',
            u'',
            [u'1980', u''],
        )

    def test_country_field(self):
        """
        Test behaviour of "Country or Region" field.
        """
        self._test_dropdown_field(
            u'country',
            u'Country or Region',
            u'Afghanistan',
            [u'Pakistan', u'Palau'],
        )

    def test_preferred_language_field(self):
        """
        Test behaviour of "Preferred Language" field.
        """
        self._test_dropdown_field(
            u'language_proficiencies',
            u'Preferred Language',
            u'',
            [u'Pushto', u''],
        )

    def test_connected_accounts(self):
        """
        Test that fields for third party auth providers exist.

        Currently there is no way to test the whole authentication process
        because that would require accounts with the providers.
        """
        for field_id, title, link_title in [
            ['auth-facebook', 'Facebook', 'Link'],
            ['auth-google', 'Google', 'Link'],
        ]:
            self.assertEqual(self.account_settings_page.title_for_field(field_id), title)
            self.assertEqual(self.account_settings_page.link_title_for_link_field(field_id), link_title)