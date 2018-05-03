function createLink(options) {
  var clientUrl = process.env.CLIENT_URL;

  if(options.udid !== undefined) {
    return `${clientUrl}/surveys/${options.udid}`;
  } else if(options.surveyId !== undefined && options.deviceId !== undefined) {
    return `${clientUrl}/surveys?surveyId=${options.surveyId}&deviceId=${options.deviceId}`;
  } else {
    return undefined;
  }
}

module.exports = { createLink };
