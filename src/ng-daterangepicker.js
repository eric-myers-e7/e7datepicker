/**
    * options: 
     { namespace: input.name,  "namespace for fired events"
       date: { "date specific options"
         limit: { "defines valid range of dates"
           start, "string or moment object"
           end    "string or moment object"
           },
         ranges: { "series of preset ranges that can be selected"
           {
              start, "string or moment object"
              end    "string or moment object"
           },...  
          },
         autoclose: true, "close the dialog on date selection"
         military: false, "whether or not to use military time"
         corner: bottom-left,  "which corner should the datepicker render from, " 
         dropdowns: false, "boolean value whether the month year should be drop downs",
         exclusionCallback:  function (date) {} "function returning boolean that will limit specific dates.  
                              Receives date in iteration as yyyy-mm-dd"       }
         locale: {
           format: 'MM/DD/YYYY',  "format of the date display"
           ranges: 'Custom Ranges',  "title of the custom ranges section"
           monthsShort: moment.monthsShort(), "array of short names of the months"
           weekDaysMin: moment.weekdaysMin(), "array of short names of the week"
           dayOfWeek: 1, first day of week,
           done: 'Done' 
         }
       }
       time: {
         autoclose: true, "close the dialog on date selection"
         military: false, "whether or not to use military time"
         corner: bottom-left,  "which corner should the datepicker render from, " 
         locale: {
           done: 'Done', "text is done",
           morning: 'AM', 
           afternoon: 'PM'
         }
       }
     } 
    */
(function() {
  'use strict';

  function CalendarController(scope, element, attr, ctrls) {
    this.selected = null;
    this.today = moment();
    this.viewDate = moment();

    this.isToday = function(day) {
      return day == this.today;
    };

    this.isCurrentMonth = function(day) {
      return day.month() == today.month();
    };

    this.isWeekend = function(day) {
      return day.isoWeekday > 5;
    };

    this.isSelected = function(day) {
      return this.selected && this.selected === day;
    };

    this.isHighlighted = function(day) {
      if (this.highlightCallback) {
        return this.highlightCallback(day);
      }
      return false;
    };

    this.jogMonth = function(jog) {
      //backward jan -> dec also change year
      if (jog < 0 && (this.viewDate.month() === 0)) {
        jog(this.viewDate, -1, 'years')
      }

      //forward dec -> jan also change year
      if (jog > 0 && (this.viewDate.month() === 11)) {
        jog(this.viewDate, 1, 'years')
      }

      return jog(this.viewDate, jog, 'months');
    };

    this.jogYear = function(jog) {
      return jog(this.viewDate, jog, 'years');
    };

    function jog(date, jog, period) {
      if (jog === 0) {
        throw 'Quit jogging in place!!';
      }

      if (jog > 0) {
        date.add(jog, period);
      } else {
        date.subtract(jog, period);
      }

      return date;
    }

    this.update = function() {
      curDate = this.viewDate.clone();
      calendar = [];

      for (var i = 0; i < 6; i++) {
        _calendar[i] = [];
      }

      for (i = 0, col = 0, row = 0; i < 42; i++, col++) {
        if (i > 0 && (col % 7) === 0) {
          col = 0;
          row++;
        }

        calendar[row][col] = moment(curDate).add(24, 'hour').clone();
        curDate.hour(12);
      }

      scope.calendar = calendar;
    };

    this.select = function(day) {
      this.selected = day;
      if (scope.selectCallback) {
        scope.selectCallback(day);
      }
    };
  }


  function createDateType(time, local) {
    time = time || false;
    local = local || false;
    return function(scope, element, attr, ctrls) {
      var options = {
        date: {
          limit: {},
          ranges: {},
          autoclose: true,
          military: false,
          corner: 'bottom-left',
          dropdowns: false,
          exclusionCallback: null,
          locale: {
            format: 'mm/dd/yyy',
            ranges: 'Custom Ranges',
            monthsShort: moment.monthsShort(),
            weekDaysMin: moment.weekDaysMin(),
            dayOfWeek: 1
          }
        },
        time: {
          corner: 'bottom-left',
          autoclose: true,
          military: false,
          locale: {
            done: 'Done',
            morning: 'AM',
            afternoon: 'PM'
          }
        }
      };

      var currentStartDate = moment();
      var currentEndDate = moment();
    };
  }

  function timeType(scope, element, attr, ctrls) {
    var options = {
      time: {
        corner: 'bottom-left',
        autoclose: true,
        military: false,
        locale: {
          done: 'Done',
          morning: 'AM',
          afternoon: 'PM'
        }
      }
    };
  }

  angular.module('ng-datepicker', [])
    .directive('ngDatepicker', ['$templateCache', '$compile', '$window', function($templateCache, $compile, $window) {
      return {
        require: '?ngModel',
        restrict: 'A',
        scope: {
          name: '@ngDatepicker'
        },
        link: function(scope, element, attr, ctrl) {
          this.input = element;
          var template = $templateCache.get('ngdatetimepicker/datepicker.html');
          $compile(template)(scope);

          this.popover = angular.element(template);

          var touchSupported = 'ontouchstart' in window,
            mousedownEvent = 'mousedown' + (touchSupported ? ' touchstart' : ''),
            mousemoveEvent = 'mousemove.ngdatepicker' + (touchSupported ? ' touchmove.clockpicker' : ''),
            mouseupEvent = 'mouseup.ngdatepicker' + (touchSupported ? ' touchend.clockpicker' : '');

          this.show = function() {
            if (isShowing) return;
            $window.document.on('focusin.ngdatepicker click.ngdatepicker mousedown.ngdatepicker touchend.ngdatepicker mouseup.ngdatepicker',
              $proxy(function(e) {
                if (
                  target.closest(this.input).length ||
                  target.closest(this.popover).length ||
                  target.closest('.calendar-table').length
                ) return;
              }, this));
          };

          this.position = function() {
            var css = {
              top: 0,
              right: auto,
              left: 0
            };
            
            var parentOffset = {
              top: 0,
              left: 0
            };

            css.top = vertical();
            angular.extend(css, horizontal());

            var horizontal = function() {
              var pos = {};
              switch (scope.position.subString(3)) {
                case 'left':
                  pos = {
                    right: this.container.offset().left < 0 ? 'auto' : $(window).width() - this.element.offset().left - this.element.outerWidth(),
                    left: this.container.offset().left < 0 ? 9 : 'auto'
                  };
                  break;
                case 'center':
                  pos = {
                    left: this.container.offset().left < 0 ? 9 : this.element.offset().left - parentOffset.left + this.element.outerWidth() / 2 - this.container.outerWidth() / 2,
                  };
                  break;
                default:
                  var containerPastRight = this.container.offset().left + this.container.outerWidth() > $(window).width();
                  pos = {
                    left: containerPastRight ? 'auto' : this.element.offset().left - parentOffset.left,
                    right: containerPastRight ? 0 : css.right
                  };
              }
              return pos;
            }.bind(this);

            var vertical = function() {
              if (scope.positon.subString(0, 3) === 'top') {
                this.container.addClass('dropup');
                return this.element.offset().top - this.container.outerHeight() - parentOffset.top;
              } else if (scope.positon.subString(0, 6) === 'bottom') {
                return this.element.offset().top + this.element.outerHeight() - parentOffset.top;
              }
            }.bind(this);

          };
        }
      };
    }])

  .directive('ngCalendar', ['$templateCache', function($templateCache, $compile, $window) {
    return {
      require: '?ngDatepicker',
      restrict: 'E',
      template: 'ngdatetimepicker/calendar.html',
      controller: 'CalendarController as calCtrl',
      scope: {
        name: '@',
        selectCallback: '&',
        highlightCallback: '&'
      },
      link: function(scope, element, attr, ctrl) {}
    };
  }]);

}());
