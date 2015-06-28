"""
Settings to run Studio in devstack using optimized static assets.

This configuration changes Studio to use the optimized static assets generated for testing,
rather than picking up the files directly from the source tree.

The following Paver command can be used to run Studio in optimized mode:

  paver devstack studio --optimized

You can also generate the assets explicitly and then run Studio:

  paver update_assets cms --settings=test_static_optimized
  paver devstack studio --settings=devstack_optimized --fast

Note that changes to JavaScript assets will not be picked up automatically
as they are for devstack. Instead, update_assets must be invoked each time
that changes have been made.
"""

# We intentionally define lots of variables that aren't used, and
# want to import all variables from base settings files
# pylint: disable=wildcard-import, unused-wildcard-import

# Pylint gets confused by path.py instances, which report themselves as class
# objects. As a result, pylint applies the wrong regex in validating names,
# and throws spurious errors. Therefore, we disable invalid-name checking.
# pylint: disable=invalid-name, no-name-in-module

from path import path

########################## Devstack settings ###################################

from .devstack import *  # pylint: disable=wildcard-import, unused-wildcard-import

TEST_ROOT = path(__file__).abspath().dirname().dirname().dirname() / "test_root"  # pylint: disable=no-value-for-parameter

############################ STATIC FILES #############################

# Enable debug so that static assets are served by Django
DEBUG = True

#  Serve static files at /static directly from the staticfiles directory under test root.
# Note: optimized files for testing are generated with settings from test_static_optimized
STATIC_URL = "/static/"
STATICFILES_FINDERS = (
    'staticfiles.finders.FileSystemFinder',
)
STATICFILES_DIRS = (
    (TEST_ROOT / "staticfiles").abspath(),
)