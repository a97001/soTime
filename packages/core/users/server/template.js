'use strict';

module.exports = {
  forgot_password_email: function(user, req, token, mailOptions) {
    mailOptions.html = [
      'Hi ' + user.name + ',',
      'We have received a request to reset the password for your account.',
      'If you made this request, please click on the link below or paste this into your browser to complete the process:',
      'http://' + req.headers.host + '/reset/' + token,
      'This link will work for 1 hour or until your password is reset.',
      'If you did not ask to change your password, please ignore this email and your account will remain unchanged.'
    ].join('\n\n');
    mailOptions.subject = 'Resetting the password';
    return mailOptions;
  },
  createAccount: function(account, password, mailOptions) {
    mailOptions.html = [
      'Hello ' + account.name + ',',
      '',
      'Your user account has been set up by your company administrator.',
      'User Email: ' + account.email,
      'User Password: ' + password,
      'Please change your password immediately after logging into the system: ',
      'http://accounts.negawattutility.com/',
      '',
      'Negawatt Utility Limited',
      '***************************************************',
      'This is an automatically generated email, please do not reply',
      '***************************************************',
      '',
      '',
      'Disclaimer - This above message, including any attachment, may contain personal, confidential and/or proprietary information, and is intended only for the person(s) or entity/entities to whom it was originally addressed. If you are not the intended recipient, please notify us and destroy this message immediately. Further transmission, dissemination or other use of, or taking of any action in reliance upon, such information by anyone other than the intended recipient(s) is prohibited and may contravene local or international law. Moreover, email communications cannot be guaranteed to be error-free or virus-free. We disclaim any liability arising there from. All information and opinions given therein are entirely those of the message sender(s) and are not necessarily endorsed by Negawatt Utility Limited.'
    ].join('<br>');
    mailOptions.subject = 'Welcome to Negawatt Utility';
    return mailOptions;
  },

  test: function(mailOptions) {
    mailOptions.html = [
      'test',
      'test1',
      'test2'
    ].join('\n\n');
    mailOptions.subject = 'test mail server';
    return mailOptions;
  }
};
