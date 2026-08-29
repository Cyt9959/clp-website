// mobile nav
  var burger=document.getElementById('burger'),links=document.getElementById('navLinks');
  burger.addEventListener('click',function(){links.classList.toggle('open')});
  links.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){links.classList.remove('open')})});
  // enquiry form -> Formspree, submitted via fetch so the page does not navigate away.
  // The endpoint lives on the form's action attribute in index.html.
  var enquiry=document.getElementById('enquiry'),sentNote=document.getElementById('sentNote');
  enquiry.addEventListener('submit',function(e){
    e.preventDefault();
    var btn=enquiry.querySelector('button[type=submit]'),label=btn.textContent;
    btn.disabled=true;btn.textContent='Sending...';
    fetch(enquiry.action,{
      method:'POST',
      headers:{'Accept':'application/json'},
      body:new FormData(enquiry)
    }).then(function(r){
      if(!r.ok)throw new Error(r.status);
      sentNote.textContent='Thank you - your enquiry has been received. A partner will respond shortly.';
      sentNote.style.display='block';
      enquiry.reset();
    }).catch(function(){
      sentNote.textContent='Sorry, your enquiry could not be sent. Please email office@chooleepartners.com or call +60 10-563 9869.';
      sentNote.style.display='block';
    }).then(function(){btn.disabled=false;btn.textContent=label;});
  });
  // hero slider
  var track=document.getElementById('slideTrack'),cur=0;
  if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    setInterval(function(){cur=(cur+1)%2;track.style.transform='translateX(-'+(cur*50)+'%)'},6000);
  }
  // scroll reveal
  var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target)}})},{threshold:.12});
  document.querySelectorAll('.reveal').forEach(function(el){io.observe(el)});
