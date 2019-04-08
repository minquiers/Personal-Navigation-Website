var searchContentHttpResponse;
//拓展String.startWith
String.prototype.startWith = function (s) {
	if (s == null || s == "" || this.length == 0 || s.length > this.length)
		return false;
	if (this.substr(0, s.length) == s)
		return true;
	else
		return false;
	return true;
};

//拓展autocomplete完成高亮
$.extend($.ui.autocomplete.prototype, {
	_renderItem: function (ul, item) {
		var searchMask = this.element.val();
		var html = "";
		if (item.label && item.label.startWith(searchMask)) {
			html = searchMask + "<strong>" + item.label.replace(searchMask, "") + "</strong>";
		} else {
			html = item.label;
		}
		return $("<li>")
			.append($("<div>").html(html))
			.appendTo(ul);
	}
});

//初始化查询引擎
function initSearchEngine() {
	if (config.engines) {
		for (var engine in config.engines) {
			$(".dropdown-menu").append($("<li><a href=\"javascript:$('#engine').html('" + engine + "');\">" + engine + "</a></li>"));
		}
	}
};

//初始化tab
function initTabs() {
	if (config && config.tabs) {
		for (var index in config.tabs) {
			var tab = config.tabs[index];
			var tabHeader = $("<li role=\"presentation\" class=\"" + (tab.active ? "active" : "") + "\"><a href=\"#" + tab.key + "\" aria-controls=\"" + tab.key + "\" role=\"tab\" data-toggle=\"tab\">" + tab.name + "</a></li>");
			$(".nav-tabs").append(tabHeader);

			var tbodys = "";
			if (tab.values && tab.values.length > 0) {
				for (var i = 0; i < tab.values.length; i++) {
					var value = tab.values[i];
					var href = mRedirect() ? (value.mhref?value.mhref:value.href) : value.href;
					if(value.hidden){
						continue;
					}
					var tabBody = "<div class=\"col-sm-3 col-xs-4\"><a href=\"" + href + "\" target=\"_blank\" class=\"thumbnail\"><img src=\"" + (value.img?value.img:config.default.img) + "\" width=\"50%\" alt=\"" + value.caption + "\"><div class=\"caption\"><strong>" + value.caption + "</strong></div></a></div>";
					tbodys += tabBody;
				}
				$(".tab-content").append($("<div role=\"tabpanel\" class=\"tab-pane " + (tab.active ? "active" : "") + " \" id=\"" + tab.key + "\">" + tbodys + "</div>"));
			}
		}
	}
};

//是否重定向
function mRedirect() {
    var sUserAgent = navigator.userAgent.toLowerCase();
    var bIsIpad = sUserAgent.match(/ipad/i) == "ipad";
    var bIsIphoneOs = sUserAgent.match(/iphone os/i) == "iphone os";
    var bIsMidp = sUserAgent.match(/midp/i) == "midp";
    var bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4";
    var bIsUc = sUserAgent.match(/ucweb/i) == "ucweb";
    var bIsAndroid = sUserAgent.match(/android/i) == "android";
    var bIsCE = sUserAgent.match(/windows ce/i) == "windows ce";
    var bIsWM = sUserAgent.match(/windows mobile/i) == "windows mobile";
    if (bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM) {
        return true;
    }
};

//搜索框自动完成
$("#searchContent").autocomplete({
	source: function (request, response) {
		if (request.term) {
			searchContentHttpResponse = response;
			var data = config["suggestion"]["Baidu"]["data"];
			data["wd"] = request.term;
			remoteSuggestion(config["suggestion"]["Baidu"]["url"], data);
		}
	},
	"delay": 140
}).click(function () {
	$(this).autocomplete("search", this.value);
}).focus();

//远程请求自动提示
function remoteSuggestion(suggestionUrl, d) {
	try {
		$.ajax({
			url: suggestionUrl,
			dataType: "JSONP",
			data: d,
			success: null
		});
	} catch (e) {
	}
};

//百度自动提示
window.baidu = {
	sug: function (json) {
		if (searchContentHttpResponse) {
			try {
				searchContentHttpResponse(json.s);
			} catch (e) {
			}
		}
	}
};

//查询按钮绑定
$('#search').on('click', function () {
	var $btn = $(this).button('loading');
	var searchContent = $.trim($("#searchContent").val());
	if (searchContent) {
		try {
			var engine = $("#engine").html();
			var searchType = $("input[name=searchType]:checked").val();
			window.open(config["engines"][engine][searchType] + searchContent);
		} catch (e) {
			alert(e);
		}
	}

	$btn.button('reset');
});


//键盘按键绑定(回车13 删除8 ↑38 ↓40 ←37 →39 esc 27)
$(document).keydown(function (e) {
	if (e.keyCode == 13) {
		event.preventDefault();
		$("#search").click();
	} else if (e.keyCode == 8) {
		$("#searchContent").focus();
	} else if (e.keyCode == 38) {
		if (!$("#searchContent").is(":focus")) {
			event.preventDefault();
			var selectArr = $(".dropdown-menu > li > a");
			var selectValue = $("#engine").html();
			for (var i = 0; i < selectArr.length; i++) {
				if (selectValue === selectArr[i].innerHTML) {
					if ((i - 1) >= 0) {
						$("#engine").html(selectArr[i - 1].innerHTML);
					}
					break;
				}
			}
		}
	} else if (e.keyCode == 40) {
		if (!$("#searchContent").is(":focus")) {
			event.preventDefault();
			var selectArr = $(".dropdown-menu > li > a");
			var selectValue = $("#engine").html();
			for (var i = 0; i < selectArr.length; i++) {
				if (selectValue === selectArr[i].innerHTML) {
					if ((i + 1) <= (selectArr.length - 1)) {
						$("#engine").html(selectArr[i + 1].innerHTML);
					}
					break;
				}
			}
		}
	} else if (e.keyCode == 37) {
		if (!$("#searchContent").is(":focus")) {
			event.preventDefault();
			var radioArr = $("input[name=searchType]");
			var radioValue = $("input[name=searchType]:checked").val();
			for (var i = 0; i < radioArr.length; i++) {
				if (radioValue === $(radioArr[i]).val()) {
					if ((i - 1) >= 0) {
						$(radioArr[i]).removeAttr("checked");
						$(radioArr[i - 1]).prop("checked", true);
					}
					break;
				}
			}
		}
	} else if (e.keyCode == 39) {
		if (!$("#searchContent").is(":focus")) {
			event.preventDefault();
			var radioArr = $("input[name=searchType]");
			var radioValue = $("input[name=searchType]:checked").val();
			for (var i = 0; i < radioArr.length; i++) {
				if (radioValue === $(radioArr[i]).val()) {
					if ((i + 1) <= (radioArr.length - 1)) {
						$(radioArr[i]).removeAttr("checked");
						$(radioArr[i + 1]).prop("checked", true);
					}
					break;
				}
			}
		}
	} else if (e.keyCode == 27) {
		if ($("#searchContent").is(":focus")) {
			$("#searchContent").blur();
		} else {
			$("#searchContent").focus();
		}
	}
});

$(function () {
	initSearchEngine();
	initTabs();
});
