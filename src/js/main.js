$.fn.isInViewport = function() {
  var elementTop = $(this).offset().top;
  var elementBottom = elementTop + $(this).outerHeight();
  var viewportTop = $(window).scrollTop();
  var viewportBottom = viewportTop + $(window).height();
  return elementBottom > viewportTop && elementTop < viewportBottom;
};

$( document ).ready(function() {
  var arCardYindex = [];
  // An array of y coordinates of cards


  /**
   * FUNCTION scrollToCard
   * @param {*} cardId 
   */
  function scrollToCard(cardId = 1) {
    if( !parseInt(cardId, 10) ) {
      console.log('Card ID is not a valid integer');
    }

    // Reset passed in value to int
    cardId = parseInt(cardId,10);

    if(document.querySelector('[data-card-id="' + (cardId) + '"]')) {
      var nextCard = document.querySelector('[data-card-id="' + (cardId) + '"]');
    } else {
      nextCard = document.querySelector('[data-card-id="1"]');
    }
    
    // Navigation animations, exit nav on card rotation
    $('.nav-toggle').removeClass('nav-rotate-btn');
    $('nav').removeClass('nav-pull');

    // Scroll to target card number
    nextCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // Navigation
  $('.nav-toggle').click(function(){
    $(this).find('a').unbind();
    $(this).toggleClass('nav-rotate-btn');
    $('nav').toggleClass('nav-pull');
  });

  $('.card-nav a').click(function(){
    for(var i=0; i <= arCardYindex.length-1; i++) {
      var top = window.pageYOffset;
      if(top <= arCardYindex[i] - 50) {
        scrollToCard(i+1);
        return true;
      } 
    }
    scrollToCard(1);
  });

  // Add a vertical position to each card/section
  $('.page-card').each(function() {
    var cardId = parseInt($(this).attr('data-card-id'),10);
    var winHeight = window.innerHeight;
    var cardMarginTop = (winHeight * cardId) - winHeight;
    arCardYindex.push(cardMarginTop);
    $('[data-card-id=' + cardId + ']').css('top',((cardId*100)-100)+'vh');
  });

  // Reset card body content to be loaded from slide/local nav
  $('.page-card .card-body').each(function() {
    /*
    var cardId = parseInt($(this).attr('data-card-body-id'),10);
    if(cardId == false) {
      return false;
    }
    var cardXPos = (cardId*100) - 100;
    $('[data-card-body-id=' + cardId + ']').css('position','absolute');
  
    $('[data-card-body-id=' + cardId + ']').css('margin-left',cardXPos+'%');
    */
  });

  // Navigation Click Handlers
  $('.logo a').click(function(){
    scrollToCard(1);
  });

  $('#NavAbout').click(function(){
    scrollToCard(2);
  });

  $('#NavServices').click(function(){
    scrollToCard(3);
  });

  $('#NavOurWork').click(function(){
    scrollToCard(4);
  });

  $('#NavPricing').click(function(){
    scrollToCard(5);
  });

  $('#NavPrivacy').click(function(){
    scrollToCard(6);
  });

  $('#NavTips').click(function(){
    scrollToCard(7);
  });


});