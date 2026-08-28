// mobile nav
  var burger=document.getElementById('burger'),links=document.getElementById('navLinks');
  burger.addEventListener('click',function(){links.classList.toggle('open')});
  links.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){links.classList.remove('open')})});
  // enquiry form (sample only)
  document.getElementById('enquiry').addEventListener('submit',function(e){e.preventDefault();document.getElementById('sentNote').style.display='block';this.reset();});
  // hero slider
  var track=document.getElementById('slideTrack'),cur=0;
  if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    setInterval(function(){cur=(cur+1)%2;track.style.transform='translateX(-'+(cur*50)+'%)'},6000);
  }
  // scroll reveal
  var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target)}})},{threshold:.12});
  document.querySelectorAll('.reveal').forEach(function(el){io.observe(el)});
