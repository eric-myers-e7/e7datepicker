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
    this.id = 'calCtrl';
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

  function DatePickerController(scope, element, attr, ctrls) {
    this.id = 'dateCtrl';
    this.selectedDate = {};
    this.viewDate = {};

    this.isHighlighted = function(day) {
      //if range select all between range
      if (scope.range === true) {
        return (day > this.viewDate.startDate || day < this.viewDate.endDate);
      }
      return false;
    };

  }

  function createDateType(time, local) {
    time = time || false;
    local = local || false;
    return function(scope, element, attr, ctrls) {
      

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
        require: '[dateCtrl, ?ngModel]',
        restrict: 'A',
        controller: 'DatePickerController as dateCtrl',
        scope: {
          name: '@ngDatepicker'
        },
        link: function(scope, element, attr, ctrl) {
          var dateCtrl = ctrl[0];
          var modelCtrl = ctrl[1];
          this.input = element;
          var template = $templateCache.get('ngdatetimepicker/datepicker.html');
          $compile(template)(scope);

          var popover = angular.element(template);
          popover.appendTo('body');
          var datepicker = new DatePicker(element, popover, $window);
          this.input.on('click.ngdatepicker', function () { datepicker.show(); });
          scope.$watch('leftDate', function() {
            if (options.range === true) {
              dateCtrl.selectedDate.start = dateCtrl.leftDate;
              if (!_.isEmpty(dateCtrl.rightDate)) {
                dateCtrl.selectedDate.end = dateCtrl.rightDate;
              }
            } else {
              dateCtrl.selectedDate = dateCtrl.leftDate;
            }
            datepicker.hide();
          });

          scope.$watch('rightDate', function() {
            dateCtrl.selectedDate.end = dateCtrl.rightDate;
          });
        }
      };
    }])

  .directive('ngCalendar', ['$templateCache', function($templateCache, $compile, $window) {
    return {
      require: '[calCtrl, ?ngModel]',
      restrict: 'E',
      template: 'ngdatetimepicker/calendar.html',
      controller: 'CalendarController as calCtrl',
      scope: {
        name: '@',
        highlightCallback: '&'
      },
      link: function(scope, element, attr, ctrl) {}
    };
  }]);

  var DatePicker = function(input, popover, $window) {
    init();
    var init = function () {
      this.position();
      // Reposition the picker if the window is resized while it's open
      $(window).on('resize.ngdatepicker', $.proxy(function(e) {
        this.position(e);
      }, this));

      $window.document.on('focusin.ngdatepicker click.ngdatepicker mousedown.ngdatepicker touchend.ngdatepicker mouseup.ngdatepicker [data-toggle=dropdown]',
        $proxy(function(e) {
          if (
            target.closest(input).length === 0 ||
            target.closest(popover).length === 0 ||
            target.closest('.calendar-table').length === 0
          ) this.hide();
        }.bind(this), this));
    };

    this.show = function() {
      if (isShowing) return;
      popover.show();
      this.isShowing = true;
    };

    this.hide = function() {
      if (!this.isShowing) return;
      $window.off('.ngdatepicker');
      $window.document.off('ngdatepicker');
      popover.hide();
      this.isShowing = false;
    };

    this.toggle = function(e) {
      if (this.isShowing) {
        this.hide();
      } else {
        this.show();
      }
    };

    this.position = function(e) {
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
    };

    var horizontal = function() {
      var pos = {};
      switch (scope.position.subString(3)) {
        case 'left':
          pos = {
            right: this.container.offset().left < 0 ? 'auto' : $(window).width() - input.offset().left - input.outerWidth(),
            left: this.container.offset().left < 0 ? 9 : 'auto'
          };
          break;
        case 'center':
          pos = {
            left: this.container.offset().left < 0 ? 9 : input.offset().left - parentOffset.left + input.outerWidth() / 2 - this.container.outerWidth() / 2,
          };
          break;
        default:
          var containerPastRight = this.container.offset().left + this.container.outerWidth() > $(window).width();
          pos = {
            left: containerPastRight ? 'auto' : input.offset().left - parentOffset.left,
            right: containerPastRight ? 0 : css.right
          };
      }
      return pos;
    }.bind(this);

    var vertical = function() {
      if (scope.positon.subString(0, 3) === 'top') {
        this.container.addClass('dropup');
        return input.offset().top - this.container.outerHeight() - parentOffset.top;
      } else if (scope.positon.subString(0, 6) === 'bottom') {
        return input.offset().top + input.outerHeight() - parentOffset.top;
      }
    }.bind(this);
  };

})();
