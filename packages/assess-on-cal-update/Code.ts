type Nullable<T> = T | null;

export function isCancelledEvent(
  event: GoogleAppsScript.Calendar.Schema.Event
) {
  return event.status === "cancelled";
}

export function isActiveEvent(event: GoogleAppsScript.Calendar.Schema.Event) {
  return new Date(event.end.dateTime) > new Date();
}

export function isNewEvent(event: GoogleAppsScript.Calendar.Schema.Event) {
  const created = new Date(event.created);
  const updated = new Date(event.updated);

  return updated.getTime() - created.getTime() < 5000;
}

export function findProjectFolder(): Nullable<GoogleAppsScript.Drive.Folder> {
  const rootFolder = DriveApp.getRootFolder();
  try {
    return rootFolder
      .getFoldersByName("Technical Assessment Automation")
      .next();
  } catch (ignore) {
    return null;
  }
}

export function findOrCreateProjectFolder() {
  let projectFolder = findProjectFolder();

  if (!projectFolder) {
    const rootFolder = DriveApp.getRootFolder();
    return rootFolder.createFolder("Technical Assessment Automation");
  }

  return projectFolder;
}

export function findOrCreateSheet(name: string, headers: string[]) {
  let projectFolder = findOrCreateProjectFolder();

  try {
    const file = projectFolder.getFilesByName(name).next();
    return SpreadsheetApp.open(file);
  } catch (ignore) {
    const sheet = SpreadsheetApp.create(name);
    sheet.appendRow(headers);
    projectFolder.addFile(DriveApp.getFileById(sheet.getId()));
    return sheet;
  }
}

export function findOrCreateCandidateEmailUsernameSheet() {
  return findOrCreateSheet("Candidate Email Username", [
    "Email",
    "GitHub Username",
  ]);
}

export function findCandidateFormsFolder() {
  const projectFolder = findProjectFolder();
  if (!projectFolder) {
    return null;
  }

  try {
    return projectFolder.getFoldersByName("Candidate Forms").next();
  } catch (ignore) {
    return null;
  }
}

export function findOrCreateCandidateFormsFolder() {
  const candidateFormsFolder = findCandidateFormsFolder();

  if (!candidateFormsFolder) {
    const projectFolder = findOrCreateProjectFolder();
    return projectFolder.createFolder("Candidate Forms");
  }

  return candidateFormsFolder;
}

export function createCandidateForm(
  candidate: GoogleAppsScript.Calendar.EventGuest
) {
  const candidateEmail = candidate.getEmail();
  const form = FormApp.create(
    "GitHub Username Request for " + candidateEmail.split("@")[0]
  );
  form.setLimitOneResponsePerUser(true);
  form.setConfirmationMessage("Thanks for submitting your GitHub username!");

  form
    .addTextItem()
    .setHelpText("Please enter the email address you used to apply to Rise8")
    .setTitle("Email")
    .setRequired(true)
    .setValidation(
      FormApp.createTextValidation()
        .requireTextIsEmail()
        .requireTextMatchesPattern(candidateEmail)
        // @ts-ignore
        .build()
    );
  form
    .addTextItem()
    .setHelpText("Please enter your GitHub username")
    .setTitle("Username")
    .setRequired(true);
  form.setRequireLogin(false);

  const folder = findOrCreateCandidateFormsFolder();
  const file = DriveApp.getFileById(form.getId());
  folder.addFile(file);

  file.addViewer(candidateEmail);

  ScriptApp.newTrigger("onFormSubmit").forForm(form).onFormSubmit().create();
}

export function sendFormToCandidate(
  event: GoogleAppsScript.Calendar.Schema.Event
) {
  const domain =
    PropertiesService.getScriptProperties().getProperty("ORG_DOMAIN");
  const calEvent = CalendarApp.getEventById(event.id);

  const candidate = calEvent
    .getGuestList()
    .find((guest) => guest.getEmail().split("@")[1] !== domain);
  if (!candidate) {
    return;
  }

  createCandidateForm(candidate);
}
export function removeTrigger(triggerUid: string) {
  const trigger = ScriptApp.getProjectTriggers().find(
    (trigger) => trigger.getUniqueId() === triggerUid
  );
  ScriptApp.deleteTrigger(trigger);
}

export function updateOrInsertCandidateEmailUsernameRowInSheet(
  sheet: GoogleAppsScript.Spreadsheet.Spreadsheet,
  email: string,
  username: string
) {
  const values = sheet.getDataRange().getValues();

  const row = values.findIndex((row) => row[0] === email);
  if (row === -1) {
    sheet.appendRow([email, username]);
  } else {
    const a1Notation = `A${row + 1}:B${row + 1}`;
    sheet.getRange(a1Notation).setValues([[email, username]]);
  }
}

export function removeFormFromCandidateFormsFolder(
  form: GoogleAppsScript.Forms.Form
) {
  const folder = findCandidateFormsFolder();
  if (!folder) {
    console.error(
      "Could not find candidate forms folder. Unable to remove form."
    );
    return;
  }

  DriveApp.getFileById(form.getId()).setTrashed(true);
}

export function forEachEvent(
  calendarId: string,
  callback: (event: GoogleAppsScript.Calendar.Schema.Event) => void
) {
  let options: { maxResults: number; syncToken?: string; pageToken?: string } =
    { maxResults: 2500 };

  const syncToken =
    PropertiesService.getScriptProperties().getProperty("syncToken");

  if (syncToken) {
    options.syncToken = syncToken;
  }

  let eventList;
  let pageToken;

  do {
    if (pageToken) {
      options.pageToken = pageToken;
    }

    eventList = Calendar.Events.list(calendarId, options);

    eventList.items.forEach(callback);

    pageToken = eventList.nextPageToken;
  } while (pageToken);

  PropertiesService.getScriptProperties().setProperty(
    "syncToken",
    eventList.nextSyncToken
  );
}

export function onFormSubmit(e: {
  response: GoogleAppsScript.Forms.FormResponse;
  source: GoogleAppsScript.Forms.Form;
  triggerUid: string;
}) {
  const form = FormApp.openById(e.source.getId());
  if (!form) {
    console.error("Could not find form.");
    return;
  }

  const sheet = findOrCreateCandidateEmailUsernameSheet();

  if (!sheet) {
    console.error("Could not find or create sheet.");
    return;
  }

  const values = e.response
    .getItemResponses()
    .map((response) => response.getResponse()) as [string, string];
  if (values.length !== 2) {
    console.error("Expected 2 values, got " + values.length + ".");
    return;
  }
  const [email, username] = values;

  updateOrInsertCandidateEmailUsernameRowInSheet(sheet, email, username);
  removeFormFromCandidateFormsFolder(form);
  removeTrigger(e.triggerUid);
}

export function onCreateCalendarEvent(
  e: GoogleAppsScript.Events.CalendarEventUpdated
) {
  forEachEvent(
    e.calendarId,
    (event: GoogleAppsScript.Calendar.Schema.Event) => {
      if (isCancelledEvent(event)) {
        /**
         * TODO: The following should be replaced with logic that removes
         *  the candidates row and form
         */
        return;
      }

      if (!isNewEvent(event)) {
        return;
      }

      if (!isActiveEvent(event)) {
        return;
      }

      sendFormToCandidate(event);
    }
  );
}
