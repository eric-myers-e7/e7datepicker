angular.module('ng-daterangepicker', [])

.run(['$templateCache', function($templateCache) {
  $templateCache.put('ngdatetimepicker/datepicker.html', '<div id="datepicker-{{ name }}" class="datepicker dropdown-menu">\n' +
      '<div class="calendar left">\n' +
      '<ng-calendar options="dateCtrl.options" name="{{ name }}-left"  ng-model="dateCtrl.leftDate"  hightlight-callback="dateCtrl.isActive(day)"></ng-calendar>' +
      '</div>\n' +
      '<div class="calendar right" ng-show="dateCtrl.isRange()">\n' +
      '<ng-calendar options="dateCtrl.options" name="{{ name }}-right" ng-model="dateCtrl.rightDate" highlight-callback="dateCtrl.isActive(day)"></ng-calendar>' +
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