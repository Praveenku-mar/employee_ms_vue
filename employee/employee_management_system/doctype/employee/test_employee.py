# Copyright (c) 2026, Praveenkumar Dhanasekar and Contributors
# See license.txt

import frappe
from frappe.tests import IntegrationTestCase, UnitTestCase


# On IntegrationTestCase, the doctype test records and all
# temporary documents created with frappe.get_doc and inserted
# with doc.insert are automatically added to the test log and deleted.
EXTRA_TEST_RECORD_DEPENDENCIES = []  # eg. ["User"]


class UnitTestEmployee(UnitTestCase):
	"""
	Unit tests for Employee.
	Use this class for testing individual functions and methods.
	"""

	pass


class IntegrationTestEmployee(IntegrationTestCase):
	"""
	Integration tests for Employee.
	Use this class for testing interactions between multiple components.
	"""

	pass
