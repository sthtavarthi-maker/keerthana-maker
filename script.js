const linksConfig=window.portfolioLinks||{};
const isHttpsUrl=(value,host)=>{try{const url=new URL(value);return url.protocol==='https:'&&(!host||url.hostname===host)}catch{return false}};
const setExternal=(element,url,{host,mailto=false}={})=>{if(!element)return false;if(mailto){if(typeof url!=='string'||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(url)){element.hidden=true;element.removeAttribute('href');return false}element.href=`mailto:${url}`}else{if(!isHttpsUrl(url,host)){element.hidden=true;element.removeAttribute('href');return false}element.href=url;element.target='_blank';element.rel='noopener noreferrer'}element.hidden=false;return true};
const profileHosts={github:'github.com',linkedin:'www.linkedin.com'};
document.querySelectorAll('[data-profile-link]').forEach(element=>{const name=element.dataset.profileLink;if(name==='email')setExternal(element,linksConfig.email,{mailto:true});else setExternal(element,linksConfig[name],{host:profileHosts[name]})});
document.querySelectorAll('[data-project-repository]').forEach(element=>{const project=linksConfig.projects?.[element.dataset.projectRepository];setExternal(element,project?.repository,{host:'github.com'})});
document.querySelectorAll('[data-project-demo]').forEach(element=>{const project=linksConfig.projects?.[element.dataset.projectDemo];if(project?.liveDemo)setExternal(element,project.liveDemo,{host:null});else{element.hidden=true;element.removeAttribute('href')}});
const toggle=document.querySelector('.menu-toggle');const nav=document.querySelector('.nav');toggle.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Close navigation':'Open navigation')});nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{nav.classList.remove('open');toggle.setAttribute('aria-expanded','false')}));
const sections=[...document.querySelectorAll('main section[id]')];const navLinks=[...nav.querySelectorAll('a[href^="#"]')];const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)navLinks.forEach(link=>link.classList.toggle('active',link.hash==='#'+entry.target.id))}),{rootMargin:'-35% 0px -55% 0px'});sections.forEach(section=>observer.observe(section));
const form = document.querySelector('#contact-form');
if (form) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const status = document.querySelector('#form-status');
    const submitButton = form.querySelector('button[type="submit"]');
    const recipient = linksConfig.email;
    if (typeof recipient !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) {
      status.textContent = 'Email delivery is not configured yet. Please use the email link below.';
      status.dataset.state = 'error';
      return;
    }

    const fields = new FormData(form);
    if (location.protocol === 'file:') {
      status.textContent = 'Open this portfolio through a web server before sending a message.';
      status.dataset.state = 'error';
      return;
    }

    const payload = {
      name: fields.get('name'),
      email: fields.get('email'),
      _replyto: fields.get('email'),
      _subject: `Portfolio inquiry from ${fields.get('name')}`,
      message: fields.get('message')
    };

    submitButton.disabled = true;
    submitButton.textContent = 'Sending…';
    status.textContent = 'Sending your message…';
    status.dataset.state = 'pending';

    try {
      const response = await fetch(`https://formsubmit.co/ajax/${recipient}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok || result.success === false) {
        throw new Error(result.message || 'The message could not be sent.');
      }
      form.reset();
      status.textContent = 'Message submitted successfully. Thank you for reaching out!';
      status.dataset.state = 'success';
    } catch (error) {
      status.textContent = 'Your message could not be sent right now. Please try again or use the email link below.';
      status.dataset.state = 'error';
    } finally {
      submitButton.disabled = false;
      submitButton.innerHTML = 'Send message <span>↗</span>';
    }
  });
}