Std.plugin.module("datePicker",{
    events:"apply dateClick",
    option:{
        value:"",
        editable:true,
        format:"yyyy-MM-dd h:m:s"
    },
    public:{
        value:function(value){
            var that = this;
            if(value === undefined){
                return that.widget.value();
            }
            that.widget.value(value);
            return that;
        },
        remove:function(){
            this.datePicker.remove();
        }
    },
    main:function(that,opts,widget){
        var datePicker = that.datePicker = Std.ui("datePicker",Std.extend({
            renderTo:"body",
            visible:false
        },opts));

        datePicker[0].css({
            position:"absolute"
        });
        datePicker.on({
            dateClick:function(){
                datePicker.hide();
                that.emit("apply",that.value());

                if(widget.ui === "lineEdit"){
                    widget.value(that.value());
                }
            }
        });
        widget[0].on("click",function(e){
            var offset = widget[0].offset();
            datePicker[0].css({
                top: offset.y + widget.height(),
                left: offset.x,
                zIndex: Std.ui.status.zIndex++
            });
            datePicker.show();

            e.stopPropagation()
        });
    }
});

Std.ui.module("datePicker",{
    parent:"widget",
    events:"dateClick",
    option:{
        className:"StdUI_DatePicker",
        value:"",
        editable:true,
        format:"yyyy-MM-dd h:m:s"
    },
    extend:{
        /*
         * extend render
        */
        render:function(){
            var that = this;
            var opts = that.opts;

            that.value(opts.value);
            that.initEvents();
        }
    },
    private:{
        /*
         * date count
        */
        dateCount:function(year,month){
            var that = this;
            if(year == undefined){
                return new Date(that.year(),that.month() - 1,0).getDate();
            }
            var date = new Date(year,month - 1,0);

            return date.getDate();
        },
        /*
         * edit value
        */
        editValue:function(key,blur){
            var target;
            var that    = this;

            if(key === "year"){
                target = that.D.year;
            }else if(key === "month"){
                target = that.D.month;
            }

            if(!that.opts.editable){
                return that;
            }
            newDom("input").insertAfter(target.hide()).css({
                width:target.outerWidth()
            }).on({
                focus:function(){
                    var input     = this;
                    var mousedown = function(e){
                        if(!input.is(e.target)){
                            input.blur();
                            that[0].off("mousedown",mousedown);
                        }
                    };
                    input.value(target.text());

                    that[0].on("mousedown",mousedown);
                },
                blur:function(){
                    var input = this;
                    var value = input.value();

                    if(value.isNumber() && blur.call(target,~~value)){
                        target.html(value);
                    }
                    input.remove();
                    target.show();
                }
            }).focus().select();

            return that;
        },
        /*
         * update dates
        */
        updateDates:function(){
            var that       = this;
            var doms       = that.D;
            var doms_dates = that.D.dates;

            for(var i in doms_dates){
                doms_dates[i].remove();
            }
            doms_dates = that.D.dates = {};

            var maxDay = that.dateCount();
            var year   = that.year();
            var month  = that.month();
            var day    = new Date(year,month - 1).getDay();

            if(day > 0){
                if(month < 1){
                    year--;
                    month = 12;
                }
                var n = that.dateCount(year,month);

                for(var i=1;i<=day;i++){
                    var dom_date = newDom("span","_date _lastMonthDate").html(n - day + i);
                    doms_dates[-i] = dom_date;
                    doms.dateBox.append(dom_date);
                }
            }
            for(var i=1;i<=maxDay;i++){
                var dom_date = newDom("span");
                var className = "_date";
                if(i == that.date()){
                    className += " selected";
                }
                dom_date.addClass(className).html(i);
                doms_dates[i] = dom_date;
                doms.dateBox.append(dom_date);
            }
            return that;
        },
        /*
         * init events
        */
        initEvents:function(){
            var that  = this;
            var doms  = that.D;

            that[0].on("mousedown",function(e){
                return false;
            });
            doms.year.mouse({
                click:function(e){
                    that.editValue("year",function(value){
                        if(value > 1000 && value < 10000){
                            that.year(value);
                            return true;
                        }
                    });
                }
            });
            doms.month.mouse({
                click:function(){
                    that.editValue("month",function(value){
                        if(value > 0 && value < 13){
                            that.month(value);
                            return true;
                        }
                    });
                }
            });
            doms.dateBox.on("click",function(e){
                var target = e.target;

                if(doms.dateBox.is(target)){
                    return false;
                }
                if(!Std.dom(target).hasClass("_lastMonthDate")){
                     that.date(target.innerHTML);
                }else{
                    if(that.month() - 1 < 1){
                        that.year(that.year() - 1);
                        that.month(12);
                    }else{
                        that.month(that.month() - 1);
                    }
                    that.date(target.innerHTML);
                }
                that.emit("dateClick");
            });
            doms.prevYear.on("click",function(){
                that.year(that.year() - 1);
            });
            doms.nextYear.on("click",function(){
                that.year(that.year() + 1);
            });
            doms.prevMonth.on("click",function(){
                var month = that.month() - 1;
                if(month < 1){
                    that.year(that.year() - 1);
                    that.month(12);
                }else{
                    that.month(month);
                }
            });
            doms.nextMonth.on("click",function(){
                var month = that.month() + 1;
                if(month > 12){
                    that.year(that.year() + 1);
                    that.month(1);
                }else{
                    that.month(month);
                }
            });
            return that;
        }
    },
    public:{
        /*
         * get day
        */
        day:function(){
            return this._date.getDay();
        },
        /*
         * editable
        */
        editable:function(state){
            return this.opt("editable",state);
        },
        /*
         * get or set year
        */
        year:function(year){
            var that = this;
            var date = that._date;

            if(year === undefined){
                return ~~date.getFullYear();
            }

            date.setFullYear(year);
            that.D.year.html(year);
            return that.updateDates();
        },
        /*
         * get or set month
        */
        month:function(month){
            var that = this;
            var date = that._date;

            if(month === undefined){
                return ~~date.getMonth() + 1;
            }

            if(month > 12){
                month = 12;
            }else if(month < 1){
                month = 1;
            }
            date.setMonth(month - 1);
            that.D.month.html(month);

            return that.updateDates();
        },
        /*
         * get or set date
        */
        date:function(n){
            var that       = this;
            var date       = that._date;
            var doms_dates = that.D.dates;

            if(n === undefined){
                return date.getDate();
            }
            var dateToday = that.date();
            if(doms_dates[dateToday]){
                doms_dates[dateToday].className("_date");
            }
            date.setDate(n);
            doms_dates[n].className("_date selected");

            return that;
        },
        /*
         * value
         */
        value:function(value){
            var date;
            var that = this;
            var opts = that.opts;

            if(value === undefined){
                return that._date.format(opts.format);
            }
            date = that._date = new Date();

            if(value !== ""){
                date.format(opts.format,value);
            }
            that.year(date.getFullYear());
            that.month(date.getMonth() + 1);
            that.date(date.getDate());
            that.updateDates();
            return that;
        }
    },
    main:function(that,opts,dom){
        var doms = that.D = {
            dates:{}
        };

        dom.unselect(true).append([
            doms.header = newDiv("_header").append([
                doms.prevYear  = newDiv("_btn _prevYear").html("◀"),
                doms.year      = newDiv("_value _year"),
                doms.nextYear  = newDiv("_btn _nextYear").html("▶"),

                doms.prevMonth = newDiv("_btn _prevMonth").html("◀"),
                doms.month     = newDiv("_value _month"),
                doms.nextMonth = newDiv("_btn _nextMonth").html("▶")

            ]),
            newDiv("_body").append([
                doms.dayBox  = newDiv("_dayBox"),
                doms.dateBox = newDiv("_dateBox")
            ]),
            newDiv("_footer")
        ]);

        //---------
        Std.each(["Su","Mo","Tu","We","Th","Fr","Sa"],function(i,value){
            doms.dayBox.append(newDom("span","_day").html(value));
        });
    }
});

