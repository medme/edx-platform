# Factories are self documenting
# pylint: disable=missing-docstring
from factory.django import DjangoModelFactory, ImageField

from student.models import LinkedInAddToProfileConfiguration

from certificates.models import (
    GeneratedCertificate, CertificateStatuses, CertificateHtmlViewConfiguration, CertificateWhitelist, BadgeAssertion,
    BadgeImageConfiguration,
)


class GeneratedCertificateFactory(DjangoModelFactory):

    class Meta:
        model = GeneratedCertificate

    course_id = None
    status = CertificateStatuses.unavailable
    mode = GeneratedCertificate.MODES.honor
    name = ''


class CertificateWhitelistFactory(DjangoModelFactory):

    class Meta:
        model = CertificateWhitelist

    course_id = None
    whitelist = True


class BadgeAssertionFactory(DjangoModelFactory):
    class Meta:
        model = BadgeAssertion

    mode = 'honor'


class BadgeImageConfigurationFactory(DjangoModelFactory):

    class Meta:
        model = BadgeImageConfiguration

    mode = 'honor'
    icon = ImageField(color='blue', height=50, width=50, filename='test.png', format='PNG')


class CertificateHtmlViewConfigurationFactory(DjangoModelFactory):

    class Meta:
        model = CertificateHtmlViewConfiguration

    enabled = True
    configuration = """{
            "default": {
                "accomplishment_class_append": "accomplishment-certificate",
                "platform_name": "edX",
                "company_about_url": "http://www.edx.org/about-us",
                "company_privacy_url": "http://www.edx.org/edx-privacy-policy",
                "company_tos_url": "http://www.edx.org/edx-terms-service",
                "company_verified_certificate_url": "http://www.edx.org/verified-certificate",
                "document_stylesheet_url_application": "/static/certificates/sass/main-ltr.css",
                "logo_src": "/static/certificates/images/logo-edx.png",
                "logo_url": "http://www.edx.org"
            },
            "honor": {
                "certificate_type": "Honor Code",
                "document_body_class_append": "is-honorcode"
            },
            "verified": {
                "certificate_type": "Verified",
                "document_body_class_append": "is-idverified"
            },
            "xseries": {
                "certificate_type": "XSeries",
                "document_body_class_append": "is-xseries"
            }
        }"""


class LinkedInAddToProfileConfigurationFactory(DjangoModelFactory):

    class Meta:
        model = LinkedInAddToProfileConfiguration

    enabled = True
    company_identifier = "0_0dPSPyS070e0HsE9HNz_13_d11_"
    trk_partner_name = 'unittest'
