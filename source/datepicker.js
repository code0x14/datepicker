(function(window,document,undefined){

    //----------
    window.newDom = function(str){
        return $(document.createElement(str));
    }
    window.newDiv = function(){
        return newDom("div");
    }
    window.widgets = {};


    //=============datePicker
    window.widgets.datePicker = function(){
        var that = this;
        var doms = that.dom = {
            main:newDiv(),

            header:newDiv(),
            prev:newDiv(),
            switchBox:newDiv(),
            year:newDiv(),
            sep:newDiv(),
            month:newDiv(),
            next:newDiv(),

            dayBox:newDiv(),
            dateBox:newDiv(),

            footer:newDiv()
        }
        //---------
        that.doms_dates = {};
        //---------
        doms.main.addClass("ui datePicker ui_unselstart");
        doms.header.addClass("header");
        doms.dayBox.addClass("dayBox");
        doms.dateBox.addClass("dateBox");
        //---------
        doms.year.addClass("year");
        doms.sep.html(" - ").addClass("sep");
        doms.month.addClass("month");

        doms.switchBox.append([doms.year,doms.sep,doms.month]);
        //---------
        doms.prev.html("‹").addClass("btn prev");
        doms.switchBox.addClass("switchBox");
        doms.next.html("›").addClass("btn next");

        doms.header.append([doms.prev,doms.switchBox,doms.next]);

        //---------
        doms.footer.addClass("footer");
        //---------
        var dayName = ["Su","Mo","Tu","We","Th","Fr","Sa"];
        for(var i=0,nLen=dayName.length;i<nLen;i++){
            var dom_day = newDom("span");
            dom_day.addClass("day");
            dom_day.html(dayName[i]);
            doms.dayBox.append(dom_day);
        }

        //---------
        doms.main.append([doms.header,doms.dayBox,doms.dateBox,doms.footer]);
        //---------

        that.initListenter();
    }
    window.widgets.datePicker.prototype = {
        render:function(){
            this.update();
            this.updateDates();
        },
        initListenter:function(){
            var that = this,
                doms = that.dom;

            doms.main.on("selectstart",function(e){
                return false;
            });
            doms.dateBox.on("click",function(e){
                var target = e.target;
                if(!$(target).hasClass("lastMonthDay")){
                    if(target !== doms.dateBox){
                        that.date(target.innerHTML);
                        if(typeof(that.itemClick) == "function"){
                            that.itemClick.call(that,e);
                        }
                    }
                }else{
                    if(that.month() - 1 < 1){
                        that.year(that.year() - 1);
                        that.month(12);
                    }else{
                        that.month(that.month() - 1);
                    }
                }
            });
            doms.prev.on("click",function(e){
                var n = that.month();
                if(n < 1){
                    that.year(that.year() - 1);
                    that.month(12);
                }else{
                    that.month(n);
                }
            });
            doms.next.on("click",function(e){
                var n = that.month() + 1;
                if(n > 12){
                    that.year(that.year() + 1);
                    that.month(1);
                }else{
                    that.month(n);
                }
            });
            return that;
        },
        update:function(){
            var that = this;
            var date = that._date = new Date();

            that.year(date.getFullYear());
            that.month(date.getMonth() + 1);
            that.date(date.getDate());

            return that;
        },
        updateDates:function(){
            var that = this,
                doms = that.dom,
                doms_dates = that.doms_dates;

            for(var i in doms_dates){
                doms_dates[i].remove();
            }
            doms_dates = that.doms_dates = {};

            var maxDay = that.dateCount();
            var year = that.year();
            var month = that.month();
            var day = new Date(year,month - 1).getDay();

            if(day > 0){
                if(month < 1){
                    year--;
                    month = 12;
                }
                var n = that.dateCount(year,month);
                for(var i=1;i<=day;i++){
                    var dom_date = newDom("span");
                    dom_date.addClass("date lastMonthDate").html(n - day + i);
                    doms_dates[-i] = dom_date;
                    doms.dateBox.append(dom_date);
                }
            }
            for(var i=1;i<=maxDay;i++){
                var dom_date = newDom("span");
                var className = "date";
                if(i == that.date()){
                    className += " selected";
                }
                dom_date.addClass(className).html(i);
                doms_dates[i] = dom_date;
                doms.dateBox.append(dom_date);
            }
            return that;
        },
        dateCount:function(nYear,nMonth){
            var that = this;
            if(nYear == undefined){
                return new Date(that.year(),that.month() - 1,0).getDate();
            }
            var date = new Date(nYear,nMonth - 1,0);
            return date.getDate();
        },
        year:function(n){
            var that = this;
            if(n == undefined){
                return ~~that._date.getFullYear();
            }
            if(typeof(n) != "number"){
                return that;
            }

            that._date.setFullYear(n);
            that.dom.year.html(n);
            return that.updateDates();
        },
        month:function(n){
            var that = this;
            if(n == undefined){
                return ~~that._date.getMonth() + 1;
            }
            if(typeof(n) != "number"){
                return that;
            }
            if(n > 12){
                n = 12;
            }else if(n < 1){
                n = 1;
            }
            that._date.setMonth(n - 1);
            that.dom.month.html(n);
            return that.updateDates();
        },
        day:function(){
            return this._date.getDay();
        },
        date:function(n){
            var that = this,
                doms_dates = that.doms_dates;

            if(n == undefined){
                return that._date.getDate();
            }
            var nDateToday = that.date();
            if(doms_dates[nDateToday]){
                doms_dates[nDateToday].get(0).className = "date";
            }
            that._date.setDate(n);
            doms_dates[n].get(0).className = "date selected";
            return that;
        }
    }
})(window,document);