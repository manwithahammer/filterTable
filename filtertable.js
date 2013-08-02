function filterTable(selector, options) {
  function toggleFilters(header, isOn) {
		header.find('img[src="filter_on.png"]')[isOn ? 'show' : 'hide']();
		header.find('img[src="filter_off.png"]')[isOn ? 'hide' : 'show']()
	}

	function clickFilter(event) {
		var target		= $(event.target),
			parent		= target.parent();
			categories	= parent.find('.filter-categories'),
			header		= categories.parent().find('.filter-header').text();
		if (categories.css('display') === 'none') {
			// Close any other filters that may be open
			var needprocess = false;
			parent.parent().parent().find('.filter').each(function (i, f) {
				var filter = $(f);
				if (filter.find('.filter-header').text() !== header && filter.find('.filter-categories').css('display') != 'none') {					
					filter.find('.filter-categories').hide();
					needprocess = true;
				}
			});
			if (needprocess) {
        processFilters(categories);
      }
			categories.show();
		}
		else {
			categories.hide();
			processFilters(categories);
		}
	}

	function filterAdd(categories) {
		var t			= categories.parent().parent().parent().parent().parent(),
			categoryID	= parseInt(categories.attr('categoryID')),
			filterData	= jQuery.data(t[0], 'filterData'),
			idx			= $.inArray(categoryID, filterData);
		if (idx === -1) {
			filterData.push(categoryID);
		}
		console.log('New filter order: '  + filterData.join('|'));
	}

	function filterRemove(categories) {
		var t			= categories.parent().parent().parent().parent().parent(),
			categoryID	= parseInt(categories.attr('categoryID')),
			filterData	= jQuery.data(t[0], 'filterData'),
			idx			= $.inArray(categoryID, filterData);
		if (idx !== -1) {
			filterData.splice(idx, 1);
		}
		console.log('New filter order: '  + filterData.join('|'));
	}

	function clickSelectAll(event) {
		var cb			= $(event.target),
			isChecked	= cb.is(':checked'),
			categories	= cb.parent().parent();
		categories.find('.filter-category .filter-cbCategory').attr('checked', isChecked);
		toggleFilters(categories.parent(), categories.find('.filter-category .filter-cbCategory:visible').length !== categories.find('.filter-category .filter-cbCategory:checked').length);
		if (isChecked) {
			filterRemove(categories);
		}
	}

	function clickCategory(event) {
		var cb			= $(event.target),
			categories	= cb.parent().parent(),
			isOn		= categories.find('.filter-category .filter-cbCategory:visible').length !== categories.find('.filter-category .filter-cbCategory:checked:visible').length;
		categories.find('.filter-categoryAll .filter-cbCategory').attr('checked', !isOn);
		toggleFilters(categories.parent(), isOn);
		if (isOn) {
			filterAdd(categories);
		}
		else {
			filterRemove(categories);
		}
	}

	function updateCategories(t, rows, column) {
		var values = getVals(rows, column);
		t.find('.filter-categories[categoryid=' + column + '] .filter-category').each(function (j, c) {
			var category = $(c);
			if ($.inArray(category.text(), values) === -1) {
				category.hide();
			}
		});
	}

	function processFilters(categories) {
		var t			= categories.parent().parent().parent().parent().parent(),
			filterData	= jQuery.data(t[0], 'filterData'),
			rows		= t.find('tr:has(td)');
		rows.each(function (j, r) {
			jQuery.data(r, 'isShown', true);
		});
		t.find('.filter-category').show();
		$.each(filterData, function (i, column) {
			if (i > 0) {
				updateCategories(t, rows, column);
			}
			var values = t.find('.filter-categories[categoryid=' + column + '] .filter-category:has(input:checked)').map(function() {return this.textContent;});
			// console.log(values);
			rows.each(function (j, r) {
				var row = $(r);
				if ((jQuery.data(r, 'isShown') === true) && ($.inArray(row.find('td').eq(column).text(), values) === -1)) {
					jQuery.data(r, 'isShown', false);
				}
			});
		});
		rows.each(function (j, r) {
			var row = $(r);
			row[jQuery.data(r, 'isShown') === true ? 'show' : 'hide']();
		});
		for (var i = 0; i < rows.eq(0).find('td').length; ++i) {
			if ($.inArray(i, filterData) === -1) {
				updateCategories(t, rows, i)
			}
		}
	}

	function getVals(rows, column) {
		var vals = [];
		rows.each(function(i, row) {
			if (jQuery.data(row, 'isShown') === true) {
				var r = $(row);
				vals.push(r.find('td').eq(column).text());
			}
		});
		vals = unique(vals);
		return vals
	}

	var t		= $(selector),
		th		= t.find('tr:has(th) th'),
		rows	= t.find('tr:has(td)'),
		reNumber = /^\s*-?(?:\d+(?:\.\d+)?|\d{1,3}(?:,\d{3})*(?:\.\d*)?)\s*$/,
		reDate = /^\s*(?:\d{4}[-\/]\d{2}[-\/]\d{2}|\d{2}[-\/]\d{2}[-\/]\d{4})\s*$/;

	if( rows.length == 0 ) return 0;
	if( options == undefined ) options = {};
	jQuery.data(t[0], 'filterData', []);
	rows.each(function(i) {
		jQuery.data(this, 'isShown', true);
	});
	var vals = [];
	for (var i = 0; i < rows.eq(0).find('td').length; ++i) {
		if( options.filters == undefined || options.filters == 'all' || options.filters.indexOf( $(th).eq(i).text() ) != -1 )
			vals.push(getVals(rows, i));
		else vals.push( [] );
	}
	var selectAll	= $('<div>').addClass('filter-categoryAll'),
		checkBox	= $('<input>').attr('type', 'checkbox').addClass('filter-cbCategory').attr('checked', 'checked'),
		br			= $('<br/>'),
		category	= $('<div>').addClass('filter-category'),
		filter		= $('<div>').addClass('filter'),
		filterOff	= $('<img>').attr('src', 'filter_off.png'),
		filterOn	= $('<img>').attr('src', 'filter_on.png').addClass('starthidden');
	$.each(th, function(i, h) {
		if( vals[i].length == 0 ) return true;
		
		if ($.grep(vals[i], function(el, index){return reNumber.test(el);}).length === vals[i].length) {
			vals[i] = vals[i].sort(function (a, b) {return (a.replace(/,/g, '') * 1) > (b.replace(/,/g, '') * 1) ? 1 : -1;});
		}
		else if ($.grep(vals[i], function(el, index){return reDate.test(el);}).length === vals[i].length) {
			vals[i] = vals[i].sort(function (a, b) {var dtA = new Date(a), dtB = new Date(b); return (dtA === dtB) ? 0 : ((dtA > dtB) ? 1 : -1);});
		}
		else {
			vals[i] = vals[i].sort(function (a, b) {return a.localeCompare(b)});
		}
		var categories	= $('<div>').addClass('starthidden').addClass('filter-categories').attr('categoryID', i)
			.append(selectAll.clone().append(checkBox.clone()).append('(Select All)'))
		;
		$.each(vals[i], function(j, v) {
			categories.append(category.clone().append(checkBox.clone()).append(v))
		});
		h.innerHTML = $('<th>').append(
			filter.clone().append($('<div>').addClass('filter-header').text(h.textContent)).append(filterOff.clone()).append(filterOn.clone()).append(categories)
		).html();
	});
	t.find('img').click(clickFilter);
	t.find('.filter-categoryAll .filter-cbCategory').click(clickSelectAll);
	t.find('.filter-category .filter-cbCategory').click(clickCategory);
}
