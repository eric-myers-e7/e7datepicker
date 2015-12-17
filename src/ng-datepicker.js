/**
    * options: 
     { namespace: input.name,  "namespace for fired events"
       date: { "date specific options"
         limit: { "defines valid range of dates"
           start, "string or moment object"
           end    "string or moment object"
           },
         ranges: [ "series of preset ranges that can be selected"
           {
              start, "string or moment object"
              end    "string or moment object"
           },...  
          }],
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

  function CalendarController($scope, $element, $attrs, $transclude, $log) {
    this.id = 'calCtrl';
    this.selected = null;
    this.today = moment();
    this.viewDate = moment();
    this.startOfWeek = 0;
    this.options = {};
    this.years = [];
    this.year = this.viewDate.year();
    this.month = this.viewDate.month();

    this.isToday = function(day) {
      return day.isSame(this.today, 'day');
    };

    this.isCurrentMonth = function(day) {
      return day.month() === this.viewDate.month();
    };

    this.isWeekend = function(day) {
      return day.isoWeekday() > 5;
    };

    this.isSelected = function(day) {
      return day.isSame(this.selected, 'day');
    };

    this.isHighlighted = function(day) {
      if (this.highlightCallback) {
        return this.highlightCallback(day);
      }
      return false;
    };

    this.setDate = function(date) {
      this.viewDate = date.clone();
      this.updateSelectValues(date);
    }

    this.reset = function() {
      if (moment.isMoment(this.selected)) {
        this.viewDate = this.selected.clone();
      } else {
        this.viewDate = moment();
      }

      this.updateSelectValues();
      $scope.$apply();
    }

    this.updateSelectValues = function(date) {
      date = date || this.viewDate;
      this.month = this.options.months[date.month()];
      this.year = date.year();
    };

    var jog = function(date, length, period) {
      if (length === 0) {
        throw 'Quit jogging in place!!';
      }

      if (length > 0) {
        date.add(length, period);
      } else {
        date.subtract(Math.abs(length), period);
      }

      this.updateSelectValues(date);
      return date;
    }.bind(this);

    this.jogMonth = function(length) {
      return jog(this.viewDate, length, 'months');
    };

    this.jogYear = function(length) {
      return jog(this.viewDate, length, 'years');
    };

    this.select = function(day) {
      this.selected = day;
      if ($scope.selectCallback) {
        $scope.selectCallback({
          date: day.clone()
        });
      }

      this.selected = day.clone();
      this.viewDate = day.clone();
      this.updateSelectValues();
    };

    this.updateCalendar = function() {

      var calendar = [];
      var i, col, row;
      var startDate = this.viewDate.clone().startOf('month');

      startDate.subtract(Math.abs(startDate.isoWeekday() - (this.startOfWeek)), 'day');

      for (i = 0; i < 6; i++) {
        calendar[i] = [];
      }

      for (i = 0, col = 0, row = 0; i < 42; i++, col++) {
        if (i > 0 && (col % 7) === 0) {
          col = 0;
          row++;
        }

        calendar[row][col] = startDate.clone();
        startDate.add(1, 'day');
      }

      this.calendar = calendar;
    };

    this.setup = function(options) {
      this.options = options;
      this.options.years = [];
      for (var i = this.options.yearStart; i < this.viewDate.year() + 10; i++) {
        this.options.years.push(i);
      }
    };

    $scope.$watch('calCtrl.month', function(oldValue, newValue) {
      if (oldValue !== newValue) {
        this.viewDate.month(this.options.months.indexOf(this.month));
        this.updateCalendar();
      }
    }.bind(this));

    $scope.$watch('calCtrl.year', function() {
      this.viewDate.year(this.year);
      this.updateCalendar();
    }.bind(this));

    var init = function() {
      this.updateCalendar();
    }.bind(this);

    init();
  }

  function DatePickerController($scope, $element, $attrs, $transclude, $log) {
    this.id = 'dateCtrl';
    this.selectedDate = {};
    this.viewDate = {};
    this.options = {}

    this.isHighlighted = function(day) {
      //if range select all between range
      if (scope.range === true) {
        return (day > this.viewDate.startDate || day < this.viewDate.endDate);
      }
      return false;
    };

    this.hasRanges = function() {
      return (this.options.ranges && this.options.ranges.length > 0);
    }

    this.isRange = function() {
      return this.options.range;
    }

    this.setup = function(options) {
      this.options = options;
    }
  }

  angular.module('ngdatepicker', [])
    .directive('ngdatepicker', ['$templateCache', '$compile', '$window', '$log', function($templateCache, $compile, $window, $log) {
      return {
        require: ['ngModel'],
        restrict: 'A',
        controller: DatePickerController,
        controllerAs: 'dateCtrl',
        scope: {
          name: '@ngdatepicker',
          options: '@'
        },
        link: function(scope, element, attr, ctrl) {
          scope.options = scope.options || {};
          var modelCtrl = ctrl[0];
          var dateCtrl = scope.dateCtrl;
          var input = element;

          var popover = angular.element($compile($templateCache.get('ngdatetimepicker/datepicker.html'))(scope));

          popover.appendTo('body');

          var datepicker = new DatePicker(input, popover, scope.options, $window, scope);
          dateCtrl.setup(datepicker.options());
          input.on('click.ngdatepicker', function() {
            datepicker.show();
          });

          dateCtrl.selectStart = function(date) {
            $log.info('date', date);
            if (!moment.isMoment(date)) {
              throw "selected date must be a moment instance not " + typeof date;
            }
            dateCtrl.selectedDate = date;

            modelCtrl.$setViewValue(date);
            modelCtrl.$render();
            if (dateCtrl.options.autoHide) {
              popover.hide();
            }
          };

          dateCtrl.selectEnd = function(date) {
            if (!moment.isMoment(date)) {
              throw "selected date must be a moment instanct not " + typeof date;
            }
            dateCtrl.selectedDate.end = dateCtrl.rightDate;
            modelCtrl.$setViewValue(dateCtrl.selectedDate.clone());

          };

          modelCtrl.$parsers.push(function(value) {
            if (!moment.isMoment(value)) {
              var date = moment(value, getFormat(), true);
              if (date.isValid()) {
                value = date;
              } else {
                value = dateCtrl.selectedDate;
              }

            }

            dateCtrl.selectedDate = value;
            dateCtrl.leftDate = value;
            return value;
          });

          modelCtrl.$render = function() {
            if (dateCtrl.options.range === true && moment.isMoment(dateCtrl.selectedDate.start)) {
              input.val(dateCtrl.selectedDate.format(getFormat()));
            } else if (moment.isMoment(modelCtrl.$viewValue)) {
              $log.info('render', modelCtrl.$viewValue);
              dateCtrl.selectedDate = modelCtrl.$viewValue.clone();
              input.val(modelCtrl.$viewValue.format(getFormat()));
              modelCtrl
            } else if (moment.isMoment(modelCtrl.$modelValue)) {
              input.val(modelCtrl.$modelValue.format(getFormat()));
              dateCtrl.selectedDate = modelCtrl.$modelValue;
              dateCtrl.leftDate = modelCtrl.$modelValue;
            } else if (moment.isMoment(dateCtrl.selectedDate)) {
              input.val(dateCtrl.selectedDate.format(getFormat()));
            } else if (typeof modelCtrl.$modelValue === 'string') {
              var date = moment(modelCtrl.$modelValue, getFormat());
              if (date.isValid()) {
                dateCtrl.selectedDate = date;
                dateCtrl.leftDate = date;
                input.val(date.format(getFormat()));
              }
            }
          }

          var getFormat = function(date) {
            var format = dateCtrl.options.format;
            if (dateCtrl.options.time && !date) {
              format += ' ' + dateCtrl.options.timeFormat;
            }
            return format;
          }
        }
      };
    }])

  .directive('ngCalendar', ['$templateCache', '$compile', '$window', '$log', '$parse', function($templateCache, $compile, $window, $log, $parse) {
    return {
      restrict: 'E',
      priority: 1,
      templateUrl: 'ngdatetimepicker/calendar.html',
      controller: CalendarController,
      controllerAs: 'calCtrl',
      scope: {
        name: '@',
        highlightCallback: '&',
        selectCallback: '&',
        options: '=',
        dateSelected: '='
      },
      link: function(scope, element, attrs, ctrl) {
        var modelCtrl = ctrl[0];
        var calCtrl = scope.calCtrl;
        scope.options = scope.options || {};
        calCtrl.setup(scope.options);

        scope.$watch("dateSelected", function(newValue) {
          if (!angular.isDefined(newValue)) {
            newValue = moment();
          }

          if (!moment.isMoment(newValue)) {
            if (newValue === null) {
              return;
            } else {
              throw 'Calendar expects value to be a moment not ' + typeof newValue + ' ' + newValue;
            }
          }
          var date = newValue.clone();
          calCtrl.setDate(date);
          calCtrl.selected = date;
        });
        scope.$on('reset.calendar.' + scope.name.slice(0, scope.name.indexOf('-')), function(e) {
          calCtrl.reset();
        });
      }
    };
  }]).run(['$templateCache', function($templateCache) {

    $templateCache.put('ngdatetimepicker/datepicker.html', '<div id="datepicker-{{ name }}" class="datepicker dropdown-menu">\n' +
      '<div class="calendar left">\n' +
      '<ng-calendar options="dateCtrl.options" name="{{ name }}-left" select-callback="dateCtrl.selectStart(date)" date-selected="dateCtrl.leftDate"  highlight-callback="dateCtrl.isActive(day)"></ng-calendar>' +
      '</div>\n' +
      '<div class="calendar right" ng-if="dateCtrl.isRange()">\n' +
      '<ng-calendar options="dateCtrl.options" name="{{ name }}-right" select-callback="dateCtrl.selectEnd(date)" date-selected="dateCtrl.rightDate" highlight-callback="dateCtrl.isActive(day)"></ng-calendar>' +
      '</div>\n' +
      '<div class="range_inputs" ng-show="dateCtrl.hasRanges() && dateCtrl.isRange()">\n' +
      '<ul  ng-repeat=" range in dateCtrl.options.ranges"><li ng-click="dateCtrl.selectRange(range)">{{ range.name }}</li></ul>' +
      '<button class="applyBtn" disabled="disabled" type="button" ng-click="dateCtrl.apply()"></button> \n' +
      '<button class="cancelBtn" type="button" ng-click="dateCtrl.cancel()"></button>\n' +
      '</div>\n' +
      '</div>');

    $templateCache.put('ngdatetimepicker/timepicker.html', '<div class="popover clockpicker-popover">' +
      '<div class="arrow"></div>' +
      '<div class="popover-title">' +
      '<span class="clockpicker-span-hours text-primary"></span>' +
      ' : ' +
      '<span class="clockpicker-span-minutes"></span>' +
      '<span class="clockpicker-span-am-pm"></span>' +
      '</div>' +
      '<div class="popover-content">' +
      '<div class="clockpicker-plate">' +
      '<div class="clockpicker-canvas"></div>' +
      '<div class="clockpicker-dial clockpicker-hours"></div>' +
      '<div class="clockpicker-dial clockpicker-minutes clockpicker-dial-out"></div>' +
      '</div>' +
      '<span class="clockpicker-am-pm-block">' +
      '</span>' +
      '</div>' +
      '</div>'
    );

    $templateCache.put('ngdatetimepicker/calendar.html',
      '<div class="calendar-table"><table class="table-condensed">' +
      '<thead>' +
      '<tr>' +
      '<th class="prev available" ng-click="calCtrl.jogYear(-1)"> <i class="{{ options.yearLeftIcon }}"></i></th>' +
      '<th class="prev available" ng-click="calCtrl.jogMonth(-1)"><i class="{{ options.monthLeftIcon }}"></i></th>' +
      '<th ng-show="calCtrl.options.dateSelect" style="text-align:center;" colspan="3" class="month">' +
      '<select name="datepicker-month" class="form-control" ng-model="calCtrl.month" ng-options="o for o in options.months"></select>' +
      '<select name="datepicker-year" class="form-control year" ng-model="calCtrl.year" ng-options="o for o in options.years "></select></th>' +
      '<th ng-hide="calCtrl.options.dateSelect" style="text-align:center;" colspan="3" class="month">{{ calCtrl.viewDate.format(\'MMMM\') }}<br>' +
      '{{ calCtrl.viewDate.format(\'YYYY\') }}</th>' +
      '<th class="next available" ng-click="calCtrl.jogMonth(1)"><i class="{{ options.monthRightIcon }}"></i></th>' +
      '<th class="next available" ng-click="calCtrl.jogYear(1)"><i class="{{ options.yearRightIcon }}"></i></th>' +
      '</tr>' +
      '<tr>' +
      '<th ng-repeat="day in options.daysOfWeek" >{{ day }}</th>' +
      '</tr>' +
      '</thead>' +
      '<tbody>' +
      '<tr ng-repeat="week in calCtrl.calendar">' +
      '<td ng-click="calCtrl.select(day)" ng-class="{\'highlight\': calCtrl.doHighlight(day), \'today\': calCtrl.isToday(day),' +
      '\'weekend\': calCtrl.isWeekend(day), \'off\': !calCtrl.isCurrentMonth(day), \'current\': calCtrl.isSelected(day)  }"' +
      'ng-repeat="day in week" data-title="r{{ $parent.$index }}c{{ $index }}">{{ day.date() }}</td>' +
      '</tr>' +
      '</tbody>' +
      '</table></>'
    );
  }]);

  function DatePicker(input, popover, options, $window, scope) {
    options = angular.extend({
        monthLeftIcon: 'fa fa-angle-left',
        yearLeftIcon: 'fa fa-angle-double-left',
        monthRightIcon: 'fa fa-angle-right',
        yearRightIcon: 'fa fa-angle-double-right',
        range: false,
        time: false,
        timeFormat: 'HH:mm:ss',
        format: 'YYYY/MM/DD',
        position: 'bottomright',
        dateSelect: true,
        daysOfWeek: moment.weekdaysShort(),
        months: moment.months(),
        yearStart: 1990,
        autoHide: true
      },
      options || {});

    var isShowing = false;

    this.options = function() {
      return options;
    }

    this.show = function() {
      if (isShowing) return;
      popover.show();
      this.position();
      this.isShowing = true;
    };

    this.hide = function() {
      if (!this.isShowing) return;
      angular.element($window).off('.ngdatepicker');
      angular.element($window.document).off('ngdatepicker');
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
        right: 'auto',
        left: 0
      };


      css.top = vertical();
      angular.extend(css, horizontal());
      popover.css(css);
    };

    var horizontal = function() {
      var pos = {};
      var offset = 6;
      if (options.position.substr(0, 3) === 'top') {
        offset = 3
      }
      switch (options.position.substr(offset)) {
        case 'left':
          pos = {
            right: popover.offset().left <= 0 ? 'auto' : angular.element($window).width() - input.offset().left - input.outerWidth(),
            left: popover.offset().left <= 0 ? 9 : 'auto'
          };
          break;
        case 'center':
          pos = {
            left: popover.offset().left <= 0 ? 9 : input.offset().left + input.outerWidth() / 2 - popover.outerWidth() / 2,
          };
          break;
        default:
          var containerPastRight = popover.offset().left + popover.outerWidth() > angular.element($window).width();
          console.log(containerPastRight);
          pos = {
            left: containerPastRight ? 'auto' : input.offset().left + (input.outerWidth() - popover.outerWidth()),

          };
          if (containerPastRight) {
            pos.right = 0;
          }
      }
      return pos;
    }.bind(this);

    var vertical = function() {
      var top = input.offset().top - popover.outerHeight();
      var tooLow = (input.offset().top + input.outerHeight() + popover.outerHeight()) > angular.element($window).innerHeight();
      var tooHigh = (input.offset().top - popover.outerHeight()) < 0;
      if ((options.position.substr(0, 6) === 'bottom' && !tooLow) || tooHigh) {
        top = input.offset().top + input.outerHeight();
      }
      return top;
    }.bind(this);

    var init = function() {
      this.position();
      // Reposition the picker if the window is resized while it's open
      $(window).on('resize.ngdatepicker', $.proxy(function(e) {
        this.position(e);
      }, this));

      angular.element($window.document).on('focusin.ngdatepicker click.ngdatepicker mousedown.ngdatepicker touchend.ngdatepicker mouseup.ngdatepicker [data-toggle=dropdown]',
        $.proxy(function(e) {
          var target = angular.element(e.target);

          if (
            target.closest(input).length === 0 &&
            target.closest(popover).length === 0 &&
            target.closest('.calendar-table').length === 0
          ) {
            scope.$broadcast('reset.calendar.' + scope.name);
            this.hide();
          }
        }.bind(this), this));
    }.bind(this);

    init();
  }

})();