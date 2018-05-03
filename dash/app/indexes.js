const indexes = [
[
	{
		"v" : 1,
		"key" : {
			"_id" : 1
		},
		"name" : "_id_",
		"ns" : "feedbackly.apikeys"
	}
],
[
	{
		"v" : 1,
		"key" : {
			"_id" : 1
		},
		"name" : "_id_",
		"ns" : "feedbackly.basetranslations"
	}
],
[
	{
		"v" : 1,
		"key" : {
			"_id" : 1
		},
		"name" : "_id_",
		"ns" : "feedbackly.billingperiodfeedbackcounters"
	},
	{
		"v" : 2,
		"key" : {
			"organization_id" : 1,
			"period" : 1
		},
		"name" : "organization_id_1_period_1",
		"ns" : "feedbackly.billingperiodfeedbackcounters",
		"background" : true
	}
],
[
	{
		"v" : 1,
		"unique" : true,
		"key" : {
			"user_id" : 1,
			"hint_id" : 1
		},
		"name" : "user_id_1_hint_id_1",
		"ns" : "feedbackly.completedhints"
	},
	{
		"v" : 1,
		"key" : {
			"_id" : 1
		},
		"name" : "_id_",
		"ns" : "feedbackly.completedhints"
	}
],
[
	{
		"v" : 1,
		"key" : {
			"_id" : 1
		},
		"name" : "_id_",
		"ns" : "feedbackly.connections-test"
	}
],
[
	{
		"v" : 1,
		"unique" : true,
		"key" : {
			"device_id" : 1,
			"date" : -1,
			"hour" : 1
		},
		"name" : "device_id_1_date_-1_hour_1",
		"ns" : "feedbackly.dailydevicefeedbacks"
	},
	{
		"v" : 1,
		"key" : {
			"_id" : 1
		},
		"name" : "_id_",
		"ns" : "feedbackly.dailydevicefeedbacks"
	}
],
[
	{
		"v" : 1,
		"unique" : true,
		"key" : {
			"device_id" : 1
		},
		"name" : "device_id_1",
		"ns" : "feedbackly.devicefeedbacks"
	},
	{
		"v" : 1,
		"key" : {
			"_id" : 1
		},
		"name" : "_id_",
		"ns" : "feedbackly.devicefeedbacks"
	}
],
[
	{
		"v" : 1,
		"key" : {
			"organization_id" : 1
		},
		"name" : "organization_id_1",
		"ns" : "feedbackly.devicegroups"
	},
	{
		"v" : 1,
		"key" : {
			"devices" : 1
		},
		"name" : "devices_1",
		"ns" : "feedbackly.devicegroups"
	},
	{
		"v" : 1,
		"key" : {
			"devicegroups" : 1
		},
		"name" : "devicegroups_1",
		"ns" : "feedbackly.devicegroups"
	},
	{
		"v" : 1,
		"key" : {
			"type" : 1
		},
		"name" : "type_1",
		"ns" : "feedbackly.devicegroups"
	},
	{
		"v" : 1,
		"key" : {
			"_id" : 1
		},
		"name" : "_id_",
		"ns" : "feedbackly.devicegroups"
	}
],
[
	{
		"v" : 1,
		"key" : {
			"_id" : 1
		},
		"name" : "_id_",
		"ns" : "feedbackly.devicelogs"
	}
],
[
	{
		"v" : 1,
		"key" : {
			"udid" : 1
		},
		"name" : "udid_1",
		"background" : true,
		"safe" : null,
		"ns" : "feedbackly.devicepings"
	},
	{
		"v" : 1,
		"key" : {
			"day_start_in_unix" : 1
		},
		"name" : "day_start_in_unix_1",
		"background" : true,
		"safe" : null,
		"ns" : "feedbackly.devicepings"
	},
	{
		"v" : 1,
		"key" : {
			"device_id" : 1
		},
		"name" : "device_id_1",
		"ns" : "feedbackly.devicepings",
		"background" : true,
		"safe" : null
	},
	{
		"v" : 1,
		"key" : {
			"_id" : 1
		},
		"name" : "_id_",
		"ns" : "feedbackly.devicepings"
	},
	{
		"v" : 2,
		"key" : {
			"device_id" : 1,
			"day_start_in_unix" : 1
		},
		"name" : "device_id_1_day_start_in_unix_1",
		"ns" : "feedbackly.devicepings",
		"background" : true
	}
],
[
	{
		"v" : 1,
		"key" : {
			"type" : 1
		},
		"name" : "type_1",
		"ns" : "feedbackly.devices"
	},
	{
		"v" : 1,
		"key" : {
			"udid" : 1
		},
		"name" : "udid_1",
		"ns" : "feedbackly.devices"
	},
	{
		"v" : 1,
		"key" : {
			"organization_id" : 1
		},
		"name" : "organization_id_1",
		"ns" : "feedbackly.devices"
	},
	{
		"v" : 1,
		"key" : {
			"active_survey" : 1
		},
		"name" : "active_survey_1",
		"ns" : "feedbackly.devices"
	},
	{
		"v" : 1,
		"key" : {
			"_id" : 1
		},
		"name" : "_id_",
		"ns" : "feedbackly.devices"
	},
	{
		"v" : 2,
		"unique" : true,
		"key" : {
			"ip_assignment" : 1
		},
		"name" : "ip_assignment_1",
		"ns" : "feedbackly.devices",
		"sparse" : true,
		"background" : true
	}
],
[
	{
		"v" : 1,
		"key" : {
			"question_type" : 1
		},
		"name" : "question_type_1",
		"background" : true,
		"safe" : null,
		"ns" : "feedbackly.fbevents"
	},
	{
		"v" : 1,
		"key" : {
			"question_id" : 1
		},
		"name" : "question_id_1",
		"ns" : "feedbackly.fbevents",
		"background" : true
	},
	{
		"v" : 1,
		"key" : {
			"device_id" : 1
		},
		"name" : "device_id_1",
		"ns" : "feedbackly.fbevents",
		"background" : true
	},
	{
		"v" : 1,
		"key" : {
			"survey_id" : 1
		},
		"name" : "survey_id_1",
		"ns" : "feedbackly.fbevents",
		"background" : true
	},
	{
		"v" : 1,
		"key" : {
			"created_at" : -1
		},
		"name" : "created_at_-1",
		"ns" : "feedbackly.fbevents",
		"background" : true
	},
	{
		"v" : 1,
		"key" : {
			"created_at_adjusted_ts" : -1
		},
		"name" : "created_at_adjusted_ts_-1",
		"background" : true,
		"ns" : "feedbackly.fbevents"
	},
	{
		"v" : 1,
		"key" : {
			"feedback_id" : 1
		},
		"name" : "feedback_id_1",
		"ns" : "feedbackly.fbevents",
		"background" : true
	},
	{
		"v" : 1,
		"key" : {
			"organization_id" : 1
		},
		"name" : "organization_id_1",
		"ns" : "feedbackly.fbevents",
		"background" : true
	},
	{
		"v" : 1,
		"key" : {
			"created_at_adjusted_ts" : 1,
			"question_id" : 1
		},
		"name" : "created_at_adjusted_ts_1_question_id_1",
		"ns" : "feedbackly.fbevents"
	},
	{
		"v" : 1,
		"key" : {
			"question_id" : 1,
			"created_at_adjusted_ts" : 1,
			"device_id" : 1,
			"survey_id" : 1
		},
		"name" : "question_id_1_created_at_adjusted_ts_1_device_id_1_survey_id_1",
		"ns" : "feedbackly.fbevents"
	},
	{
		"v" : 1,
		"key" : {
			"device_id" : 1,
			"created_at_adjusted_ts" : -1
		},
		"name" : "device_id_1_created_at_adjusted_ts_-1",
		"ns" : "feedbackly.fbevents"
	},
	{
		"v" : 1,
		"key" : {
			"_id" : 1
		},
		"name" : "_id_",
		"ns" : "feedbackly.fbevents"
	}
],
[
	{
		"v" : 1,
		"key" : {
			"created_at_adjusted_ts" : -1,
			"survey_id" : 1,
			"device_id" : 1
		},
		"name" : "created_at_adjusted_ts_-1_survey_id_1_device_id_1",
		"ns" : "feedbackly.feedbacks"
	},
	{
		"v" : 1,
		"key" : {
			"created_at_adjusted_ts" : -1,
			"survey_id" : 1,
			"device_id" : 1,
			"period_sequence" : 1
		},
		"name" : "created_at_adjusted_ts_-1_survey_id_1_device_id_1_period_sequence_1",
		"ns" : "feedbackly.feedbacks"
	},
	{
		"v" : 1,
		"key" : {
			"data.question_id" : 1,
			"created_at_adjusted_ts" : 1
		},
		"name" : "data.question_id_1_created_at_adjusted_ts_1",
		"ns" : "feedbackly.feedbacks",
		"background" : true
	},
	{
		"v" : 1,
		"key" : {
			"device_id" : 1,
			"data.question_id" : 1,
			"created_at_adjusted_ts" : 1
		},
		"name" : "device_id_1_survey_id_1_data.question_id_1_created_at_adjusted_ts_1",
		"ns" : "feedbackly.feedbacks",
		"background" : true
	},
	{
		"v" : 1,
		"key" : {
			"device_id" : 1,
			"organization_id" : 1
		},
		"name" : "device_id_1_organization_id_1",
		"ns" : "feedbackly.feedbacks",
		"background" : true
	},
	{
		"v" : 1,
		"key" : {
			"device_id" : 1,
			"created_at_adjusted_ts" : -1
		},
		"name" : "NPS partial index",
		"ns" : "feedbackly.feedbacks",
		"background" : true,
		"partialFilterExpression" : {
			"data.question_type" : "NPS"
		}
	},
	{
		"v" : 1,
		"key" : {
			"organization_id" : 1,
			"device_id" : 1,
			"created_at" : 1
		},
		"name" : "organization_id_1_device_id_1_created_at_1",
		"ns" : "feedbackly.feedbacks",
		"background" : true
	},
	{
		"v" : 1,
		"key" : {
			"_id" : 1
		},
		"name" : "_id_",
		"ns" : "feedbackly.feedbacks"
	},
	{
		"v" : 2,
		"key" : {
			"created_at" : 1
		},
		"name" : "created_at_1",
		"ns" : "feedbackly.feedbacks",
		"background" : true
	}
],
[
	{
		"v" : 1,
		"key" : {
			"survey_id" : 1
		},
		"name" : "survey_id_1",
		"ns" : "feedbackly.feedbacks-old"
	},
	{
		"v" : 1,
		"key" : {
			"device_id" : 1
		},
		"name" : "device_id_1",
		"ns" : "feedbackly.feedbacks-old"
	},
	{
		"v" : 1,
		"key" : {
			"created_at" : -1
		},
		"name" : "created_at_-1",
		"ns" : "feedbackly.feedbacks-old"
	},
	{
		"v" : 1,
		"key" : {
			"created_at_adjusted_ts" : -1
		},
		"name" : "created_at_adjusted_ts_-1",
		"ns" : "feedbackly.feedbacks-old"
	},
	{
		"v" : 1,
		"key" : {
			"_id" : 1
		},
		"name" : "_id_",
		"ns" : "feedbackly.feedbacks-old"
	}
],
[
	{
		"v" : 1,
		"key" : {
			"_id" : 1
		},
		"name" : "_id_",
		"ns" : "feedbackly.kiosks"
	}
],
[
	{
		"v" : 1,
		"key" : {
			"_id" : 1
		},
		"name" : "_id_",
		"ns" : "feedbackly.lapa"
	}
],
[
	{
		"v" : 1,
		"key" : {
			"_id" : 1
		},
		"name" : "_id_",
		"ns" : "feedbackly.leads"
	}
],
[
	{
		"v" : 2,
		"key" : {
			"_id" : 1
		},
		"name" : "_id_",
		"ns" : "feedbackly.loadcounts"
	},
	{
		"v" : 2,
		"key" : {
			"device_id" : 1,
			"date" : 1,
			"sessionId" : 1,
			"type" : 1
		},
		"name" : "date_1_device_id_1_type_1",
		"ns" : "feedbackly.loadcounts",
		"background" : true
	}
],
[
	{
		"v" : 1,
		"key" : {
			"_id" : 1
		},
		"name" : "_id_",
		"ns" : "feedbackly.mailcampaigns"
	}
],
[
	{
		"v" : 1,
		"unique" : true,
		"key" : {
			"mailinglist_id" : 1,
			"email" : 1
		},
		"name" : "mailinglist_id_1_email_1",
		"ns" : "feedbackly.mailinglistaddresses"
	},
	{
		"v" : 1,
		"key" : {
			"_id" : 1
		},
		"name" : "_id_",
		"ns" : "feedbackly.mailinglistaddresses"
	}
],
[
	{
		"v" : 1,
		"key" : {
			"_id" : 1
		},
		"name" : "_id_",
		"ns" : "feedbackly.mailinglists"
	}
],
[
	{
		"v" : 1,
		"key" : {
			"_id" : 1
		},
		"name" : "_id_",
		"ns" : "feedbackly.marketing_contacts"
	}
],
[
	{
		"v" : 2,
		"key" : {
			"_id" : 1
		},
		"name" : "_id_",
		"ns" : "feedbackly.messages"
	}
],
[
	{
		"v" : 1,
		"unique" : true,
		"key" : {
			"feedback_id" : 1
		},
		"name" : "feedback_id_1",
		"ns" : "feedbackly.notificationreceipts"
	},
	{
		"v" : 1,
		"key" : {
			"_id" : 1
		},
		"name" : "_id_",
		"ns" : "feedbackly.notificationreceipts"
	}
],
[
	{
		"v" : 1,
		"key" : {
			"_id" : 1
		},
		"name" : "_id_",
		"ns" : "feedbackly.notifications"
	}
],
[
	{
		"v" : 1,
		"key" : {
			"_id" : 1
		},
		"name" : "_id_",
		"ns" : "feedbackly.notificationsSent"
	}
],
[
	{
		"v" : 1,
		"key" : {
			"_id" : 1
		},
		"name" : "_id_",
		"ns" : "feedbackly.objectlabs-system"
	}
],
[
	{
		"v" : 1,
		"key" : {
			"_id" : 1
		},
		"name" : "_id_",
		"ns" : "feedbackly.objectlabs-system.admin.collections"
	}
],
[
	{
		"v" : 1,
		"unique" : true,
		"key" : {
			"organization_id" : 1,
			"user_id" : 1
		},
		"name" : "organization_id_1_user_id_1",
		"ns" : "feedbackly.organizationrights"
	},
	{
		"v" : 1,
		"key" : {
			"_id" : 1
		},
		"name" : "_id_",
		"ns" : "feedbackly.organizationrights"
	}
],
[
	{
		"v" : 1,
		"key" : {
			"_id" : 1
		},
		"name" : "_id_",
		"ns" : "feedbackly.organizations"
	}
],
[
	{
		"v" : 1,
		"unique" : true,
		"key" : {
			"organization_id" : 1,
			"period" : 1
		},
		"name" : "organization_id_1_period_1",
		"ns" : "feedbackly.periodicfbeventcounters"
	},
	{
		"v" : 1,
		"key" : {
			"_id" : 1
		},
		"name" : "_id_",
		"ns" : "feedbackly.periodicfbeventcounters"
	}
],
[
	{
		"v" : 1,
		"unique" : true,
		"key" : {
			"device_id" : 1
		},
		"name" : "device_id_1",
		"ns" : "feedbackly.pluginsettings"
	},
	{
		"v" : 1,
		"key" : {
			"_id" : 1
		},
		"name" : "_id_",
		"ns" : "feedbackly.pluginsettings"
	}
],
[
	{
		"v" : 1,
		"key" : {
			"_id" : 1
		},
		"name" : "_id_",
		"ns" : "feedbackly.printjobs"
	}
],
[
	{
		"v" : 1,
		"key" : {
			"_id" : 1
		},
		"name" : "_id_",
		"ns" : "feedbackly.questionfeedbacks"
	}
],
[
	{
		"v" : 1,
		"key" : {
			"_id" : 1
		},
		"name" : "_id_",
		"ns" : "feedbackly.questions"
	}
],
[
	{
		"v" : 1,
		"key" : {
			"_id" : 1
		},
		"name" : "_id_",
		"ns" : "feedbackly.scheduledsurveys"
	}
],
[
	{
		"v" : 1,
		"key" : {
			"_id" : 1
		},
		"name" : "_id_",
		"ns" : "feedbackly.screenshots"
	}
],
[
	{
		"v" : 1,
		"key" : {
			"expires" : 1
		},
		"name" : "expires_1",
		"ns" : "feedbackly.sessions",
		"expireAfterSeconds" : 0
	},
	{
		"v" : 1,
		"key" : {
			"_id" : 1
		},
		"name" : "_id_",
		"ns" : "feedbackly.sessions"
	}
],
[
	{
		"v" : 1,
		"key" : {
			"_id" : 1
		},
		"name" : "_id_",
		"ns" : "feedbackly.sms_api_delivery_receipts"
	}
],
[
	{
		"v" : 1,
		"key" : {
			"_id" : 1
		},
		"name" : "_id_",
		"ns" : "feedbackly.sms_messages_temp"
	}
],
[
	{
		"v" : 1,
		"key" : {
			"_id" : 1
		},
		"name" : "_id_",
		"ns" : "feedbackly.smsbillings"
	}
],
[
	{
		"v" : 1,
		"unique" : true,
		"key" : {
			"device_id" : 1,
			"phone_number" : 1
		},
		"name" : "device_id_1_phone_number_1",
		"ns" : "feedbackly.smscontacts"
	},
	{
		"v" : 1,
		"key" : {
			"_id" : 1
		},
		"name" : "_id_",
		"ns" : "feedbackly.smscontacts"
	}
],
[
	{
		"v" : 1,
		"unique" : true,
		"key" : {
			"organization_id" : 1
		},
		"name" : "organization_id_1",
		"ns" : "feedbackly.smscounters"
	},
	{
		"v" : 1,
		"key" : {
			"_id" : 1
		},
		"name" : "_id_",
		"ns" : "feedbackly.smscounters"
	}
],
[
	{
		"v" : 1,
		"key" : {
			"_id" : 1
		},
		"name" : "_id_",
		"ns" : "feedbackly.smsdeliveryreceipts"
	}
],
[
	{
		"v" : 1,
		"key" : {
			"_id" : 1
		},
		"name" : "_id_",
		"ns" : "feedbackly.smslogs"
	}
],
[
	{
		"v" : 2,
		"key" : {
			"_id" : 1
		},
		"name" : "_id_",
		"ns" : "feedbackly.smstransactions"
	}
],
[
	{
		"v" : 1,
		"key" : {
			"_id" : 1
		},
		"name" : "_id_",
		"ns" : "feedbackly.storage"
	}
],
[
	{
		"v" : 1,
		"key" : {
			"_id" : 1
		},
		"name" : "_id_",
		"ns" : "feedbackly.survey-mini-id-seed"
	}
],
[
	{
		"v" : 1,
		"key" : {
			"_id" : 1
		},
		"name" : "_id_",
		"ns" : "feedbackly.survey-mini-ids"
	}
],
[
	{
		"v" : 1,
		"key" : {
			"device_id" : 1
		},
		"name" : "device_id_1",
		"ns" : "feedbackly.surveydevices",
		"background" : true
	},
	{
		"v" : 1,
		"key" : {
			"survey_id" : 1
		},
		"name" : "survey_id_1",
		"ns" : "feedbackly.surveydevices",
		"background" : true
	},
	{
		"v" : 1,
		"key" : {
			"_id" : 1
		},
		"name" : "_id_",
		"ns" : "feedbackly.surveydevices"
	},
	{
		"v" : 2,
		"key" : {
			"survey_id" : 1,
			"device_id" : 1
		},
		"name" : "survey_id_1_device_id_1",
		"ns" : "feedbackly.surveydevices",
		"background" : true
	}
],
[
	{
		"v" : 1,
		"key" : {
			"_id" : 1
		},
		"name" : "_id_",
		"ns" : "feedbackly.surveyemails"
	}
],
[
	{
		"v" : 1,
		"key" : {
			"_id" : 1
		},
		"name" : "_id_",
		"ns" : "feedbackly.surveyfeedbacks"
	}
],
[
	{
		"v" : 1,
		"key" : {
			"organization_id" : 1
		},
		"name" : "organization_id_1",
		"ns" : "feedbackly.surveys"
	},
	{
		"v" : 1,
		"key" : {
			"created_by" : 1
		},
		"name" : "created_by_1",
		"ns" : "feedbackly.surveys"
	},
	{
		"v" : 1,
		"key" : {
			"organization" : 1,
			"archived" : 1
		},
		"name" : "organization_1_archived_1",
		"ns" : "feedbackly.surveys"
	},
	{
		"v" : 1,
		"key" : {
			"organization" : 1,
			"archived" : 1,
			"_id" : 1
		},
		"name" : "organization_1_archived_1__id_1",
		"ns" : "feedbackly.surveys"
	},
	{
		"v" : 1,
		"key" : {
			"_id" : 1
		},
		"name" : "_id_",
		"ns" : "feedbackly.surveys"
	}
],
[
	{
		"v" : 1,
		"key" : {
			"_id" : 1
		},
		"name" : "_id_",
		"ns" : "feedbackly.tempsignups"
	}
],
[
	{
		"v" : 1,
		"key" : {
			"_id" : 1
		},
		"name" : "_id_",
		"ns" : "feedbackly.tinylinkcounters"
	}
],
[
	{
		"v" : 1,
		"unique" : true,
		"key" : {
			"code" : 1
		},
		"name" : "code_1",
		"ns" : "feedbackly.tinylinks"
	},
	{
		"v" : 1,
		"key" : {
			"_id" : 1
		},
		"name" : "_id_",
		"ns" : "feedbackly.tinylinks"
	}
],
[
	{
		"v" : 1,
		"key" : {
			"_id" : 1
		},
		"name" : "_id_",
		"ns" : "feedbackly.udidb.udists"
	}
],
[
	{
		"v" : 1,
		"key" : {
			"_id" : 1
		},
		"name" : "_id_",
		"ns" : "feedbackly.udidrequests"
	}
],
[
	{
		"v" : 1,
		"key" : {
			"_id" : 1
		},
		"name" : "_id_",
		"ns" : "feedbackly.udidsequence"
	}
],
[
	{
		"v" : 1,
		"key" : {
			"_id" : 1
		},
		"name" : "_id_",
		"ns" : "feedbackly.upsells"
	}
],
[
	{
		"v" : 1,
		"unique" : true,
		"key" : {
			"email" : 1
		},
		"name" : "email_1",
		"ns" : "feedbackly.users"
	},
	{
		"v" : 1,
		"key" : {
			"organization_id" : 1
		},
		"name" : "organization_id_1",
		"ns" : "feedbackly.users"
	},
	{
		"v" : 1,
		"key" : {
			"_id" : 1
		},
		"name" : "_id_",
		"ns" : "feedbackly.users"
	}
],
[
	{
		"v" : 1,
		"key" : {
			"organization_id" : 1
		},
		"name" : "organization_id_1",
		"ns" : "feedbackly.usersignins"
	},
	{
		"v" : 1,
		"key" : {
			"user_id" : 1
		},
		"name" : "user_id_1",
		"ns" : "feedbackly.usersignins"
	},
	{
		"v" : 1,
		"key" : {
			"organization_id" : 1,
			"sign_in" : -1
		},
		"name" : "organization_id_1_sign_in_-1",
		"ns" : "feedbackly.usersignins"
	},
	{
		"v" : 1,
		"key" : {
			"_id" : 1
		},
		"name" : "_id_",
		"ns" : "feedbackly.usersignins"
	}
],
[
	{
		"v" : 1,
		"key" : {
			"_id" : 1
		},
		"name" : "_id_",
		"ns" : "feedbackly.uuids"
	}
],
[{
	"key": {
		"type" : 1, 
    "survey_id" : 1, 
    "device_id" : 1, 
    "date" : 1
	},
	name: "type_1_survey_id_1_device_id_1_date_1",
	ns: "feedbackly.loadcounts2"
}]
]

module.exports = function(db){

indexes.forEach(q => {
	q.forEach(i => {
		const collection = i.ns.split(".")[1];
		const key = i.key
    const options = i.key._id == 1 ? {} : {background: true}
    if(i.partialFilterExpression) options.partialFilterExpression 
    db.collection(collection).ensureIndex(key, options)
    })
})
}