
(function(window,document,undefined){
    //=============calendar
    window.widgets.calendar = function(options){
        var that = this;
        var opts = that.opts = {
            width:1002,
            height:600
        }
        for(var name in options){
            opts[name] = options[name];
        }
        var doms = that.dom = {
            main:newDiv(),
            header:newDiv(),
            switchBox:newDiv(),
            prev:newDiv(),
            next:newDiv(),
            year:newDiv(),
            month:newDiv(),
            dayBox:newDiv(),
            dateDayBox:newDiv(),
            popup:newDiv(),
            popup_pointer:newDiv(),
            contextmenu:newDiv()
        }
        //---------
        that.doms_dateDays = {};
        that.doms_currentSelected = [];
        //------------
        doms.main.addClass("ui calendar ui_unselstart");
        doms.header.addClass("header");
        doms.switchBox.addClass("switchBox");
        doms.prev.addClass("button prev");
        doms.next.addClass("button next");
        doms.year.addClass("year");
        doms.month.addClass("month");
        doms.dayBox.addClass("dayBox");
        doms.dateDayBox.addClass("dateDayBox");
        //------------

        doms.switchBox.append([doms.year,doms.month]);
        //------------
        doms.header.append([doms.prev,doms.next,doms.switchBox]);
        //------------
        doms.main.append([doms.header,doms.dayBox,doms.dateDayBox]);

        //------------
        doms.main.css({
            width:opts.width,
            height:opts.height
        });

        //---------
        that.update(true);
        that.update(false);
        that.initListenter();
        that.initPopup();
    }
    window.widgets.calendar.prototype = {
        render:function(){
            var that = this;
            that.dom.switchBox.css({
                left:(that.dom.main.width() - that.dom.switchBox.width()) / 2
            });
            that.updateDateDays();
        },
        initListenter:function(){
            var that = this,
                doms = that.dom;


            var bMousedown = false;
            var bClose = true;
            var nStartID = 0;
            var getDateDayDom = function(dom){
                var pDateDayDom = $(dom);
                while(1){
                    if(pDateDayDom.hasClass("dateDay")){
                        return pDateDayDom;
                    }
                    if(pDateDayDom === doms.dateDayBox){
                        return false;
                    }
                    pDateDayDom = pDateDayDom.parentNode;
                    if(!pDateDayDom){
                        return false;
                    }
                }
                return pDateDayDom;
            }
            doms.main.on("selectstart",function(e){
                return false;
            });
            doms.dateDayBox.on("mousedown",function(e){
                var which = e.which;
                if(which != 1){
                    return;
                }
                var target = getDateDayDom(e.target);
                if(target === false){
                    return false;
                }
                var nCurrentID = ~~target.attr("currentID");
                if(nCurrentID == undefined){
                    return;
                }
                that.clearSelected();

                nStartID = nCurrentID;
                that.selectedItem(target);
                bMousedown = true;
                return false;
            });
            $(document).on("mouseup",function(e){
                if(bMousedown == true){
                    var doms_popup = doms.popup;
                    var doms_currentSelected = that.doms_currentSelected;
                    doms_popup.css({
                        display:"block",
                        left: e.pageX - doms.popup.width() / 2,
                        top:e.pageY + 12
                    });

                    if(doms_currentSelected.length == 1){
                        var date = doms_currentSelected[0].attr("date");
                        that.updatePopup("",date,date,"");
                    }else if(doms_currentSelected.length > 1){
                        var pFirst = doms_currentSelected[0];
                        var pLast = doms_currentSelected[doms_currentSelected.length - 1];
                        var beginDate = "";
                        var endDate = "";
                        var date1 = pFirst.attr("date");
                        var date2 = pLast.attr("date");
                        if(~~pFirst.attr("currentid") < ~~pLast.attr("currentid")){
                            beginDate = date1;
                            endDate = date2;
                        }else{
                            beginDate = date2;
                            endDate = date1;
                        }
                        that.updatePopup("",beginDate,endDate,"");
                    }
                }
                bMousedown = false;

                return false;
            });
            $(document).on("mousedown",function(e){
                setTimeout(function(){
                    if(bClose == true){
                        doms.contextmenu.hide();
                        doms.popup.hide();
                    }
                },50);
            });
            doms.popup.on("mousedown",function(e){
                bClose = false;
            });
            doms.popup.on("mouseup",function(e){
                bClose = true;
            });
            doms.dateDayBox.on("mouseover",function(e){
                if(bMousedown == false){
                    return;
                }
                var target = getDateDayDom(e.target);
                if(target === false){
                    return false;
                }
                var pDate = target.attr("date");
                var nCurrentID = parseInt(target.attr("currentID"));

                if(pDate == undefined  || !nCurrentID == undefined){
                    return;
                }
                if(nCurrentID > nStartID){
                    that.clearSelected();
                    for(var i=nStartID;i<=nCurrentID;i++){
                        that.selectedItem(that.doms_dateDays[i]);
                    }
                }else if(nCurrentID < nStartID){
                    that.clearSelected();
                    for(var i=nCurrentID;i<=nStartID;i++){
                        that.selectedItem(that.doms_dateDays[i]);
                    }
                }
                return false;
            });

            that.dom.header.on("mousedown",function(e){
                var target = $(e.target);
                if(target.hasClass("button")){
                    target.addClass("press");
                }
            });
            that.dom.header.on("mouseup",function(e){
                var target = $(e.target);
                if(target.hasClass("button")){
                    target.removeClass("press");
                }
            });
            that.dom.prev.on("click",function(e){
                var n = that._month - 1;
                if(n < 1){
                    that.year(that._year - 1);
                    that.month(12);
                }else{
                    that.month(n);
                }
            });
            that.dom.next.on("click",function(e){
                var n = that._month + 1;
                if(n > 12){
                    that.year(that._year + 1);
                    that.month(1);
                }else{
                    that.month(n);
                }
            });

            that.dom.dateDayBox.on("contextmenu",function(e){
                doms.contextmenu.css({
                    display:"block",
                    left:e.pageX,
                    top:e.pageY
                });
                e.preventDefault();
            });
        },
        initPopup:function(){
            var that = this;

            var dom_popup = that.dom_popup = {};
            that.dom.popup.addClass("ui calendar_popup");
            that.dom.popup_pointer.addClass("pointer top");

            dom_popup.titleBox = newDiv();
            dom_popup.titleBox.addClass("titleBox");
            dom_popup.titleInput = newDom("input");
            dom_popup.titleInput.addClass("titleInput");
            dom_popup.titleInput.attr("placeholder","新的日程");
            dom_popup.titleBox.append(dom_popup.titleInput);


            dom_popup.beginBox = newDiv();
            dom_popup.beginBox.addClass("beginBox");
            dom_popup.beginText = newDom("span");
            dom_popup.beginText.html("开始日期:");
            dom_popup.beginDate = newDom("span");
            dom_popup.beginDate.addClass("beginDate");
            dom_popup.beginBox.append(dom_popup.beginText);
            dom_popup.beginBox.append(dom_popup.beginDate)

            dom_popup.endBox = newDiv();
            dom_popup.endBox.addClass("endBox");
            dom_popup.endText = newDom("span");
            dom_popup.endText.html("结束日期:");
            dom_popup.endDate = newDom("span");
            dom_popup.endDate.addClass("endDate");
            dom_popup.endBox.append(dom_popup.endText);
            dom_popup.endBox.append(dom_popup.endDate);

            dom_popup.noteBox = newDiv();
            dom_popup.noteBox.addClass("noteBox");
            dom_popup.noteDate = newDom("textarea");
            dom_popup.noteDate.addClass("noteDate");
            dom_popup.noteBox.append(dom_popup.noteDate)

            that.dom.popup.append([dom_popup.titleBox,dom_popup.beginBox,dom_popup.endBox,dom_popup.noteBox,that.dom.popup_pointer]);

            $("body").append(that.dom.popup);
        },
        updatePopup:function(strTitle,strBeginDate,strEndDate,strNote){
            var that = this;

            var pBeginDate = strBeginDate.split("-");
            var szBeginDate = pBeginDate[0] + "年" + pBeginDate[1] + "月" + pBeginDate[2] + "日";

            var pEndDate = strEndDate.split("-");
            var strEndDate = pEndDate[0] + "年" + pEndDate[1] + "月" + pEndDate[2] + "日";

            var dom_popup = that.dom_popup;
            dom_popup.titleBox.val(strTitle);
            dom_popup.beginDate.html(szBeginDate);
            dom_popup.endDate.html(strEndDate);
            dom_popup.noteDate.val(strNote);

            return that;
        },
        clearSelected:function(){
            var that = this;
            for(var i= 0,nLen=that.doms_currentSelected.length;i<nLen;i++){
                that.doms_currentSelected[i].removeClass("selected");
            }
            that.doms_currentSelected.length = 0;
            return that;
        },
        selectedItem:function(item){
            var that = this;
            if(item instanceof Array){
                for(var i=0,nLen=item.length;i<nLen;i++){
                    that.selectedItem(item[i]);
                }
            }else if(typeof(item) == "object"){
                item.addClass("selected");
                that.doms_currentSelected.push(item);
            }
            return that;
        },
        update:function(b){
            var that = this,
                doms = that.dom;

            var date = that.date = new Date();
            if(b === true){
                doms.year.html((that._year = date.getFullYear()) + "年");
                doms.month.html((that._month = date.getMonth() + 1) + "月");
                that._dateDay = date.getDate();
            }else if(b === false){
                var maxDay = that.maxMonthDayCount();
                var headerHeight = doms.header.height() + doms.dayBox.height() || 0;
                headerHeight += ~~doms.header.css("borderTopWidth") + ~~doms.header.css("borderBottomWidth") || 0;
                headerHeight += ~~doms.dayBox.css("borderTopWidth") + ~~doms.dayBox.css("borderBottomWidth") || 0;
                headerHeight += ~~doms.header.css("paddingTop") + ~~doms.header.css("paddingBottom") || 0;
                headerHeight += ~~doms.dayBox.css("paddingTop") + ~~doms.dayBox.css("paddingBottom") || 0;


                that.itemWidth = Math.floor(that.opts.width / 7) - 1 + "px";
                that.itemHeight = Math.floor(Math.ceil(that.opts.height - headerHeight) / Math.ceil((maxDay / 7))) - 1 + "px";

                //------------
                var dayName = ["日","一","二","三","四","五","六"];
                doms.dayBox.html("");
                for(var i=0;i<7;i++){
                    var dom_day = newDom("span");
                    dom_day.width(that.itemWidth);
                    dom_day.addClass("day");
                    dom_day.html(dayName[i]);
                    doms.dayBox.append(dom_day);
                }
            }else{
                that.year(date.getFullYear())
                that.month(date.getMonth() + 1);
                that.dateDay(date.getDate());
            }
            return that;
        },
        addItem:function(data){
            var that = this;
            var szClassName = "dateDay";
            var szText = "";
            switch(data.monthType){
                case "last":
                    szClassName += " lastMonthDay";
                    break;
                case "today":
                    szClassName += " today"
                    szText = "今天";
                    break;
                case "this":
                    break;
                case "next":
                    szClassName += " nextMonthDay";
                    break;
            }

            var dom_dateDay = newDom("div");
            dom_dateDay.addClass(szClassName);
            dom_dateDay.css({
                width:that.itemWidth,
                height:that.itemHeight
            });
            dom_dateDay.attr({
                date:data.year + "-" + data.month + "-" + data.dateDay,
                currentID:data.itemID + ""
            });

            var dom_dateDay_infor = newDom("div");
            dom_dateDay_infor.addClass("infor");

            var dom_dateDay_infor_text = newDom("span");
            dom_dateDay_infor_text.addClass("text");
            dom_dateDay_infor_text.html(szText);

            var dom_dateDay_infor_num = newDom("span");
            dom_dateDay_infor_num.addClass("num");
            dom_dateDay_infor_num.html(data.text);

            dom_dateDay_infor.append([dom_dateDay_infor_text,dom_dateDay_infor_num]);
            dom_dateDay.append(dom_dateDay_infor);

            that.doms_dateDays[data.itemID] = dom_dateDay;
            that.dom.dateDayBox.append(dom_dateDay);
            return that;
        },
        updateDateDays:function(){
            var that = this,
                doms = that.dom,
                doms_dateDays = that.doms_dateDays;

            var maxDay = that.maxMonthDayCount();

            for(var i in doms_dateDays){
                doms_dateDays[i].remove();
            }
            that.doms_dateDays = {};

            var lastYear = that._year;
            var lastMonth = that._month;
            var date = new Date(lastYear);
            date.setMonth(lastMonth + 1);
            date.setDate(1);


            var nCurrentID = 0;
            var day = date.getDay();
            if(day > 0){
                if(lastMonth <= 0){
                    lastYear--;
                    lastMonth = 12;
                    alert(lastYear)
                }
                var n = that.maxMonthDayCount(lastYear,lastMonth);
                for(var i=0;i<day;i++){
                    var dateDay = n - day + i;
                    that.addItem({
                        monthType:"last",
                        text:lastMonth - 1 + " - " + dateDay,
                        year:lastYear,
                        month:lastMonth - 1,
                        dateDay:dateDay,
                        itemID:nCurrentID
                    });
                    nCurrentID++;
                }
            }
            for(var i=1;i<=maxDay;i++){
                var szMonthType = "this";
                if(i == that._dateDay && ~~that._year == ~~that.date.getFullYear() && that._month == that.date.getMonth() + 1){
                    szMonthType = "today";
                }
                that.addItem({
                    monthType:szMonthType,
                    text:i,
                    year:that._year,
                    month:that._month,
                    dateDay:i,
                    itemID:nCurrentID
                });
                nCurrentID++;
            }

            var nLastDayCount = Math.ceil(nCurrentID / 7) * 7 - nCurrentID;
            var nNextMonth = that._month + 1;
            var nNextYear = that._year;
            if(nNextMonth > 12){
                nNextMonth = 1;
                nNextYear++;
            }
            for(var i=1;i<=nLastDayCount;i++){
                that.addItem({
                    monthType:"next",
                    text:nNextMonth + " - " + i,
                    year:nNextYear,
                    month:nNextMonth,
                    dateDay:i,
                    itemID:nCurrentID
                });
                nCurrentID++;
            }
            return that;
        },
        maxMonthDayCount:function(nYear,nMonth){
            var that = this;
            if(nYear == undefined){
                return new Date(that.year(),that.month(),0).getDate();
            }
            var date = new Date(nYear,nMonth,0);
            return date.getDate();
        },
        year:function(n){
            var that = this;
            if(n == undefined){
                return that._year;
            }
            if(n != that._year){
                that._year = n;
                that.dom.year.html(n + "年");
                that.updateDateDays();
            }
            return that;
        },
        month:function(n){
            var that = this;
            if(n == undefined){
                return that._month;
            }
            if(n != that._month){
                if(n > 12){
                    n = 12;
                }else if(n < 1){
                    n = 1;
                }
                that._month = n;
                that.dom.month.html(n + "月");
                that.updateDateDays();
            }
            return that;
        },
        dateDay:function(n){
            var that = this,
                doms_dateDays = that.doms_dateDays;

            if(n == undefined){
                return that._dateDay;
            }
            if(n != that._dateDay){
                if(doms_dateDays[that._dateDay]){
                    doms_dateDays[that._dateDay].get(0).className = "dateDay";
                }
                doms_dateDays[n].get(0).className = "dateDay selected";
                that._dateDay = n;
            }
            return that;
        }
    }
})(window,document);