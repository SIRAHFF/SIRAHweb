/**
 * WEBSITE: https://themefisher.com
 * TWITTER: https://twitter.com/themefisher
 * FACEBOOK: https://www.facebook.com/themefisher
 * GITHUB: https://github.com/themefisher/
 */

$(document).ready(function () {
	'use strict';
	
	// Sticky header: compact the header once the top bar has scrolled away,
	// and fill the rule under it to show how far down the page we are.
	// Pinning itself is CSS (position: sticky); this drives the two states.
	var header = document.getElementById('myHeader');
	if (header) {
		var topBar = document.getElementById('top-bar');
		var trigger = topBar ? topBar.offsetHeight : 0;
		var isStuck = false;
		var progress = -1;
		var ticking = false;

		var updateHeader = function () {
			ticking = false;

			var shouldStick = window.pageYOffset > trigger;
			if (shouldStick !== isStuck) {
				isStuck = shouldStick;
				header.classList.toggle('is-stuck', isStuck);
			}

			// Pages shorter than the viewport have nothing to track.
			var scrollable = document.documentElement.scrollHeight - window.innerHeight;
			var read = scrollable > 0 ? window.pageYOffset / scrollable : 0;
			read = Math.min(1, Math.max(0, read));
			if (read !== progress) {
				progress = read;
				header.style.setProperty('--read-progress', read);
			}
		};

		// Batch both reads into one frame so scrolling stays cheap.
		var onScroll = function () {
			if (!ticking) {
				ticking = true;
				window.requestAnimationFrame(updateHeader);
			}
		};

		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', onScroll, { passive: true });
		updateHeader();
	}
	
	// All-atom / coarse-grained wipe. The range input carries the value, the
	// keyboard access and the accessible name; the seam can also be dragged
	// inside the figure, which is the same action by another means.
	var cgRange = document.querySelector('.cg-compare-range');
	if (cgRange) {
		var cgFigure = cgRange.closest('.cg-compare');
		var cgFrame = cgFigure.querySelector('.cg-compare-frame');

		var applyCompare = function (pct) {
			cgFigure.style.setProperty('--cg-pos', pct + '%');
		};

		var drawCompare = function () {
			applyCompare(cgRange.value);
		};

		cgRange.addEventListener('input', drawCompare);
		drawCompare();

		if (cgFrame && window.PointerEvent) {
			var cgSeek = function (clientX) {
				var box = cgFrame.getBoundingClientRect();
				var pct = ((clientX - box.left) / box.width) * 100;
				pct = Math.max(0, Math.min(100, pct));
				// The seam follows the pointer exactly; the range keeps the
				// rounded value so its thumb and the arrow keys stay in step.
				applyCompare(pct);
				cgRange.value = Math.round(pct);
			};

			var cgOnMove = function (event) {
				cgSeek(event.clientX);
			};

			var cgOnUp = function () {
				window.removeEventListener('pointermove', cgOnMove);
				window.removeEventListener('pointerup', cgOnUp);
				window.removeEventListener('pointercancel', cgOnUp);
				document.body.classList.remove('cg-dragging');
			};

			cgFrame.addEventListener('pointerdown', function (event) {
				// Before anything else: this is what stops the browser starting
				// a text selection or an image drag from inside the figure.
				event.preventDefault();

				// Tracking on window rather than capturing the pointer, so the
				// drag survives leaving the frame even where setPointerCapture
				// refuses the pointer.
				window.addEventListener('pointermove', cgOnMove);
				window.addEventListener('pointerup', cgOnUp);
				window.addEventListener('pointercancel', cgOnUp);
				document.body.classList.add('cg-dragging');

				cgSeek(event.clientX);
			});
		}
	}

	// News carousel: the track itself scrolls and snaps in CSS. This only wires
	// the arrows and dots to it, and reflects scroll position back into them.
	var newsTrack = document.getElementById('newsTrack');
	if (newsTrack) {
		var newsCards = Array.prototype.slice.call(newsTrack.querySelectorAll('.news-card'));
		var newsDots = document.getElementById('newsDots');
		var newsNavs = Array.prototype.slice.call(document.querySelectorAll('[data-news-scroll]'));

		// Card offsets are read relative to the track's own content box.
		var cardOffset = function (card) {
			return card.offsetLeft - newsCards[0].offsetLeft;
		};

		newsNavs.forEach(function (btn) {
			btn.addEventListener('click', function () {
				var dir = btn.getAttribute('data-news-scroll') === 'next' ? 1 : -1;
				// One viewport of cards, so it follows the breakpoint in use.
				newsTrack.scrollBy({ left: dir * newsTrack.clientWidth, behavior: 'smooth' });
			});
		});

		var dots = newsCards.map(function (card, i) {
			var dot = document.createElement('button');
			dot.type = 'button';
			dot.className = 'news-dot';
			dot.setAttribute('aria-label', 'Show news item ' + (i + 1));
			dot.addEventListener('click', function () {
				newsTrack.scrollTo({ left: cardOffset(card), behavior: 'smooth' });
			});
			newsDots.appendChild(dot);
			return dot;
		});

		var syncNews = function () {
			var x = newsTrack.scrollLeft;
			var max = newsTrack.scrollWidth - newsTrack.clientWidth;

			var current = 0;
			var closest = Infinity;
			newsCards.forEach(function (card, i) {
				var d = Math.abs(cardOffset(card) - x);
				if (d < closest) {
					closest = d;
					current = i;
				}
			});

			dots.forEach(function (dot, i) {
				dot.setAttribute('aria-current', i === current ? 'true' : 'false');
			});

			newsNavs.forEach(function (btn) {
				var isNext = btn.getAttribute('data-news-scroll') === 'next';
				btn.disabled = isNext ? x >= max - 1 : x <= 1;
			});
		};

		var newsTicking = false;
		newsTrack.addEventListener('scroll', function () {
			if (!newsTicking) {
				newsTicking = true;
				window.requestAnimationFrame(function () {
					newsTicking = false;
					syncNews();
				});
			}
		}, { passive: true });

		window.addEventListener('resize', syncNews, { passive: true });
		syncNews();
	}

	// navbarDropdown
	// Matches the navbar's xl collapse point: below 1200px the menu is a
	// hamburger, so the dropdown has to open on click rather than hover.
	if ($(window).width() < 1200) {
		$('.navigation .dropdown-toggle').on('click', function () {
			$(this).siblings('.dropdown-menu').animate({
				height: 'toggle'
			}, 300);
		});
	}

	$(window).on('scroll', function () {
		//.Scroll to top show/hide
		if ($('#scroll-to-top').length) {
			var scrollToTop = $('#scroll-to-top'),
				scroll = $(window).scrollTop();
			if (scroll >= 200) {
				scrollToTop.fadeIn(200);
			} else {
				scrollToTop.fadeOut(100);
			}
		}
	});
	// scroll-to-top
	if ($('#scroll-to-top').length) {
		$('#scroll-to-top').on('click', function () {
			$('body,html').animate({
				scrollTop: 0
			}, 600);
			return false;
		});
	}

	// Shuffle js filter and masonry
	var containerEl = document.querySelector('.shuffle-wrapper');
	if (containerEl) {
		var Shuffle = window.Shuffle;
		var myShuffle = new Shuffle(document.querySelector('.shuffle-wrapper'), {
			itemSelector: '.shuffle-item',
			buffer: 1
		});

		jQuery('input[name="shuffle-filter"]').on('change', function (evt) {
			var input = evt.currentTarget;
			if (input.checked) {
				myShuffle.filter(input.value);
			}
		});
	}

	$('.portfolio-single-slider').slick({
		infinite: true,
		arrows: false,
		autoplay: true,
		autoplaySpeed: 2000
	});

	$('.clients-logo').slick({
		infinite: true,
		arrows: false,
		autoplay: true,
		autoplaySpeed: 2000
	});

	$('.testimonial-slider').slick({
		slidesToShow: 1,
		infinite: true,
		arrows: false,
		autoplay: true,
		autoplaySpeed: 2000
	});


	// CountDown JS
	var countDownEl = $('.count-down');
	if (countDownEl) {
		$('.count-down').syotimer({
			year: 2021,
			month: 5,
			day: 9,
			hour: 20,
			minute: 30
		});
	}

	// Magnific Popup Image
	$('.portfolio-popup').magnificPopup({
		type: 'image',
		removalDelay: 160, //delay removal by X to allow out-animation
		callbacks: {
			beforeOpen: function () {
				// just a hack that adds mfp-anim class to markup
				this.st.image.markup = this.st.image.markup.replace('mfp-figure', 'mfp-figure mfp-with-anim');
				this.st.mainClass = this.st.el.attr('data-effect');
			}
		},
		closeOnContentClick: true,
		midClick: true,
		fixedContentPos: true,
		fixedBgPos: true
	});

	//  Count Up
	function counter() {
		var oTop;
		if ($('.count').length !== 0) {
			oTop = $('.count').offset().top - window.innerHeight;
		}
		if ($(window).scrollTop() > oTop) {
			$('.count').each(function () {
				var $this = $(this),
					countTo = $this.attr('data-count');
				$({
					countNum: $this.text()
				}).animate({
					countNum: countTo
				}, {
					duration: 1000,
					easing: 'swing',
					step: function () {
						$this.text(Math.floor(this.countNum));
					},
					complete: function () {
						$this.text(this.countNum);
					}
				});
			});
		}
	}
	$(window).on('scroll', function () {
		counter();
	});

});