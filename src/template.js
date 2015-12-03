angular.module('ng-daterangepicker', [])

.run(['$templateCache', function($templateCache) {
  $templateCache.put('ngdatetimepicker/datepicker.html', '<div id="datepicker-{{ name }}" class="daterangepicker dropdown-menu">\n' +
    '<div class="calendar left">\n' +
    '<ng-calendar name="{{ name }}-left" ng-model="dateCtrl.leftDate"  active-callback="dateCtrl.isActive(day)"></ng-calendar>' +
    '</div>\n' +
    '<div class="calendar right" ng-if="dateCtrl.isRange()">\n' +
    '<ng-calendar name="{{ name }}-right" ng-model="dateCtrl.rightDate" active-callback="dateCtrl.isActive(day)"></ng-calendar>' +
    '</div>\n' +
    '<div class="ranges" ng-if="dateCtrl.isRange()">\n' +
    '<div class="range_inputs">\n' +
    '<ul ng-if="dateCtrl.hasRanges()" ng-repeat=" name, range in range"><li ng-click="dateCtrl.selectRange(range)">{{ name }}</li></ul>' +
    '<button class="applyBtn" disabled="disabled" type="button" ng-click="dateCtrl.apply()"></button> \n' +
    '<button class="cancelBtn" type="button" ng-click="dateCtrl.cancel()"></button>\n' +
    '</div>\n' +
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
    '<div class="daterangepicker_input">\n' +
       '<input ng-model="dateCtrl.endDate" class="input-mini" type="text" name="daterangepicker_end" value="" />\n' +
       '<i class="{{ dateCtrl.calenderIconClass }}"></i>\n' +
       '<div class="calendar-time">\n' +
          '<div></div>\n' +
          '<i class="{{ dateCtrl.timeIconClass }}"></i>\n' +
       '</div>\n' +
    '</div>\n' +
    '<div class="calendar-table"><table class="table-condensed>' +
    '<thead>' +
    '<tr>' +
    '<th></th>' +
    '<th class="prev available" ngclick="calCtrl.jogMonth(-1)"><i class="{{ calCtrl.leftArrowIconClass }}"></i></th>' +
    '<th></th>' +
    '<th colspan="5" class="month">{{ calCtrl.viewDate.month() }}{{ calCtrl.viewDate.format(\'YYYY\') }}</th>' +
    '<th class="next available" ngclick="calCtrl.jogMonth(1)"><i class="{{ calCtrl.rightArrowIconClass }}"></i></th>' +
    '<th></th>' +
    '</tr>' +
    '<tr>' +
    '<th ng-repeat="day in calCtrl.daysOfWeek">{{ day }}</th>' +
    '</tr>' +
    '</thead>' +
    '<tbody>' +
    '<tr ng-repeat="week in calCtrl.calendar">' +
    '<td ng-class="{\'highlight\': calCtrl.doHighlight(day), \'today\': calCtrl.isToday(day),' +
    '\'weekend\': calCtrl.isWeekend(day), \'off\': calCtrl.isCurrentMonth(day.month()), \'selectedDate\': calCtrl.isSelected(day), \'\':  }"' +
    'ng-repeat="day in week" data-title="r{{ $parent.$index }}c{{ $index }}">{{ day.date() }}</td>' +
    '</tr>' +
    '</tbody>' +
    '</table></div>'
  );
}]);