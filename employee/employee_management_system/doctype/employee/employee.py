# Copyright (c) 2026, Praveenkumar Dhanasekar and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class Employee(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		date_of_birth: DF.Date | None
		email_id: DF.Data | None
		first_name: DF.Data
		joining_date: DF.Date | None
		last_name: DF.Data | None
		phone_number: DF.Data | None
	# end: auto-generated types

	pass


	def validate(self):
		if not self.last_name:
			frappe.throw("Last name is mandatory")
