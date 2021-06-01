document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  
  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#mail_view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  document.querySelector('#form-submit-btn').addEventListener('click', mail_submit);
}
function mail_submit(){
  const Resipients = [];
  Resipients = document.querySelector('#compose-recipients').value;
  const Subject = document.querySelector('#compose-subject').value;
  const Body = document.querySelector('#compose-body').value;

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: Resipients,
        subject: Subject,
        body: Body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
      if (result.error != null){
        alert(result.error);
        compose_email();
      }
      else{
        //alert(result.message);
        load_mailbox('sent');
      } 
      
  });
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#mail_view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    for(i=0; i<emails.length; i++){
      const mail = document.createElement('div');
      mail.setAttribute('class', 'mail_display');
      mail.setAttribute('data-id', `${i}`);
      if (emails[i].read == false) {
        mail.style.background = 'lightgrey';
      }
      else{
        mail.style.background = 'white';
      }
      if (mailbox == 'sent'){
        sender = 'ME';
      }
      else{
        sender = emails[i].sender;
      }
      mail.innerHTML = `
        <div class="row">
          <div class="col-lg-3" style="text-align: left;">${sender}</div>
          <div class="col-lg-6" style="text-align: center;">${emails[i].subject}</div>
          <div class="col-lg-3" style="text-align: center;">${emails[i].timestamp}</div>
        </div>`;
      document.querySelector('#emails-view').append(mail);
      
    }
    check_sent = false;
    if (mailbox == 'sent'){
      check_sent = true;
    }
    document.querySelectorAll('.mail_display').forEach(function(mail_display){
      mail_display.onclick = function(){
        id_mail = this.dataset.id;
        email = emails[id_mail];
        view_mail(email, check_sent);
      }
    });
  });
}

function view_mail(email, check_sent){
  fetch(`/emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#mail_view').style.display = 'block';

  //mail.setAttribute('id', 'display-mail');
  archive_button = 'Archive';
  if(email.archived == true){
    archive_button = 'Unarchive';
  }
  document.querySelector('#mail_view').innerHTML = `
  <div class='subject-mail'>${email.subject}</div>
  <div class="line"></div>
  <div class="mail-content">
    <div class='sender-mail'><strong>${email.sender}</strong></div>
    <div class="recipients-mail">To: ${email.recipients}</div>
    <div class= 'body-mail'>${email.body}</div>
  </div>
  <div class="line"></div>
  <div class="container">
    <div class="row">
      <div class="col-lg-4" style="text-align: center;">
        <button id="arc_button" class="btn btn-sm btn-outline-primary">${archive_button}</button>
      </div>
      <div class="col-lg-4" style="text-align: center;">
        <button id ="reply_button" class="btn btn-sm btn-outline-primary">Reply</button>
      </div>  
      <div class="col-lg-4" id="timestamp-mail">${email.timestamp}</div>
    </div>
  </div>`;

  if (check_sent == true){
    document.querySelector('#arc_button').style.display = 'none';
  }
  document.querySelector('#arc_button').addEventListener('click', () => archive_mail(email));
  document.querySelector('#reply_button').addEventListener('click', () => reply_mail(email));
}
function archive_mail(email){
  if (email.archived == true){
    fetch(`/emails/${email.id}`, {
      method: 'PUT',
      body: JSON.stringify({
          archived: false
      })
    })
  }
  else{
    fetch(`/emails/${email.id}`, {
      method: 'PUT',
      body: JSON.stringify({
          archived: true
      })
    })
  }
  location.reload(); 
  load_mailbox('inbox');
}
function reply_mail(email){
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#mail_view').style.display = 'none';

  document.querySelector('#compose-recipients').value = email.sender;
  subject_words = email.subject.split(" ");
  if (subject_words[0] == 'Re:'){
    document.querySelector('#compose-subject').value = email.subject;
    document.querySelector('#compose-body').value = `${email.body} \n Next Reply: \n`;
  }
  else{
    document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
    document.querySelector('#compose-body').value = `"On ${email.timestamp}, ${email.sender} wrote:\n ${email.body}" \n Reply: \n`;
  }
  document.querySelector('#form-submit-btn').addEventListener('click', mail_submit);
}