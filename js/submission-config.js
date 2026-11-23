export const submissionConfig = {
  formUrl: "",
  fields: [
    "registrationId",
    "registeredEmail",
    "registeredPhone",
    "internshipCategory",
    "internshipTrack",
    "projectTitle",
    "githubUrl",
    "demoUrl",
    "driveUrl",
    "projectDescription"
  ]
};

export function getSubmissionUrl(enrollment) {
  if (typeof enrollment.projectSubmissionUrl === "string" && /^https:\/\//.test(enrollment.projectSubmissionUrl)) {
    return enrollment.projectSubmissionUrl;
  }
  if (typeof submissionConfig.formUrl === "string" && /^https:\/\//.test(submissionConfig.formUrl)) {
    return submissionConfig.formUrl;
  }
  return null;
}
