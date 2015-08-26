""" Management command to update courses' search index """
import logging
from django.core.management import BaseCommand, CommandError
from optparse import make_option
from textwrap import dedent

from contentstore.courseware_index import CoursewareSearchIndexer
from search.search_engine_base import SearchEngine
from elasticsearch import exceptions

from opaque_keys.edx.keys import CourseKey
from opaque_keys import InvalidKeyError
from opaque_keys.edx.locations import SlashSeparatedCourseKey
from opaque_keys.edx.locator import CourseLocator

from .prompt import query_yes_no

from xmodule.modulestore.django import modulestore


class Command(BaseCommand):
    """
    Command to re-index courses

    Examples:

        ./manage.py reindex_course <course_id_1> <course_id_2> - reindexes courses with keys course_id_1 and course_id_2
        ./manage.py reindex_course --all - reindexes all available courses
        ./manage.py reindex_course --setup - reindexes all courses for devstack setup
    """
    help = dedent(__doc__)

    can_import_settings = True

    args = "<course_id course_id ...>"

    all_option = make_option('--all',
                             action='store_true',
                             dest='all',
                             default=False,
                             help='Reindex all courses')

    setup_option = make_option('--setup',
                               action='store_true',
                               dest='setup',
                               default=False,
                               help='Reindex all courses on developers stack setup')

    option_list = BaseCommand.option_list + (all_option, setup_option)

    CONFIRMATION_PROMPT = u"Re-indexing all courses might be a time consuming operation. Do you want to continue?"

    def _parse_course_key(self, raw_value):
        """ Parses course key from string """
        try:
            result = CourseKey.from_string(raw_value)
        except InvalidKeyError:
            result = SlashSeparatedCourseKey.from_deprecated_string(raw_value)

        if not isinstance(result, CourseLocator):
            raise CommandError(u"Argument {0} is not a course key".format(raw_value))

        return result

    def handle(self, *args, **options):
        """
        By convention set by Django developers, this method actually executes command's actions.
        So, there could be no better docstring than emphasize this once again.
        """
        all_option = options.get('all', False)
        setup_option = options.get('setup', False)
        valid_option = all_option or setup_option

        if len(args) == 0 and not valid_option:
            raise CommandError(u"reindex_course requires one or more arguments: <course_id>")

        store = modulestore()

        if valid_option:
            if setup_option:
                try:
                    searcher = SearchEngine.get_search_engine(CoursewareSearchIndexer.INDEX_NAME)
                except exceptions.ElasticsearchException as exc:
                    logging.exception('Search Engine error - %s', unicode(exc))
                    return

                index_mapping = searcher.get_mappings(
                    CoursewareSearchIndexer.INDEX_NAME,
                    CoursewareSearchIndexer.DOCUMENT_TYPE
                )
                if index_mapping:
                    return

            if setup_option or query_yes_no(self.CONFIRMATION_PROMPT, default="no"):
                course_keys = [course.id for course in modulestore().get_courses()]
            else:
                return
        else:
            course_keys = map(self._parse_course_key, args)

        for course_key in course_keys:
            CoursewareSearchIndexer.do_course_reindex(store, course_key)
