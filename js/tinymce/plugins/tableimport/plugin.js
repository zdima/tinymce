/**
 * plugin.js
 *
 * Copyright, Dmiriy Zakharkin
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*global tinymce:true */

tinymce.PluginManager.add('tableimport', function(editor) {

	function showDialogToTable() {
		var win,
			data = {
				delimiterType: '|'
			};

		function onSubmitForm() {
			var domTable, text, $ = editor.getWin().parent.jQuery;
			var data = win.toJSON();
			var delimiter = '|';

			if (data !== null) {
				delimiter = data.delimiterType;
				if (delimiter == '?') {
					delimiter = data.delimCustomValue;
				}
			}

			text = editor.selection.getContent();
			// remove any other tags
			text = text.replace(/<(\/)*(span|font|img|a)(.*?)>/ig , '');
			// remove <p>
			text = text.replace(/<p[^>]*>/ig, '');
			// convert <p></p> and <br*> to new-line
			text = text.replace(/<\/p>/ig, '\n');
			text = text.replace(/<br[^>]*>/ig, '\n');
			// remove dupplicate \n
			text = text.replace(/\n\n*/g, '\n');
			text = text.replace(/&nbsp;/g, ' ');
			// trim spaces
			text = text.replace(/^\s*/g, '').replace(/\s*$/g, '');

			// create table element
			domTable = $('<table border="1" cellspacing="0" cellpadding="0">');

			// convert each line into row
			text.split('\n').forEach(function (line) {
				line = line.replace(/^\s*/g, '').replace(/\s*$/g, '');
				if (line !== "") {
					// create row element
					var row = $('<tr></tr>');
					// make sure here is no other tags
					line = $("<div>" + line + "</dev>").text();
					// convert each line element into cell
					line.split(delimiter).forEach(function (colData) {
						var cell = $('<td></td>');
						cell.append(colData);
						row.append(cell);
					});
					domTable.append(row);
				}
			});
			// replace selection with table
			// wrap into div to be able capute the <table> tag
			editor.selection.setContent(domTable.clone().wrap('<div></div>').parent().html());
			editor.nodeChanged();
		}

		// when delimiter selected we might need enable text field to use custom delimiter
		function updateDelimiter(val) {
			var altCtrl = win.find('#delimCustomValue');
			if (val === "?") {
				altCtrl.show();
			} else {
				altCtrl.hide();
			}
		}

		//
		// General settings shared between simple and advanced dialogs
		var generalFormItems = [{
			type: 'container',
			label: 'Delimiter',
			layout: 'flex',
			direction: 'row',
			align: 'left',
			spacing: 5,
			items: [{
				label: 'Symbol',
				name: 'delimiterType',
				type: 'listbox',
				text: 'Pipe',
				minWidth: 100,
				values: [
					{text: 'Pipe', value: '|'},
					{text: 'Coma', value: ','},
					{text: 'Custom', value: '?'}
				],
				onselect: function(e) {
					updateDelimiter(e.control.value());
				}
			},
			{
				name: 'delimCustomValue',
				type: 'textbox',
				maxLength: 1,
				size: 1,
				ariaLabel: 'Character:'
			}]
		}];

		// Simple default dialog
		win = editor.windowManager.open({
			title: 'Convert text to table',
			data: data,
			body: generalFormItems,
			onSubmit: onSubmitForm
		});

		win.resizeToContent();
		updateDelimiter(data.delimiterType);
	}

	function showDialogToText() {
		var win,
			data = {
				delimiterType: '|'
			};

		function onSubmitForm() {
			var domTable, text, $ = editor.getWin().parent.jQuery;
			var data = win.toJSON(), dom = editor.dom, selectedElement;
			var delimiter = '|', rowIdx, cellIdx;

			if (data !== null) {
				delimiter = data.delimiterType;
				if (delimiter == '?') {
					delimiter = data.delimCustomValue;
				}
			}

			text = "";
			selectedElement = editor.selection.getNode();
			domTable = dom.getParent(selectedElement, 'table');
			for (rowIdx = 0; rowIdx < domTable.rows.length; rowIdx++) {
				for (cellIdx = 0; cellIdx < domTable.rows[rowIdx].cells.length; cellIdx++) {
					if (cellIdx > 0) {
						text = text + delimiter;
					}
					text = text + domTable.rows[rowIdx].cells[cellIdx].innerText;
				}
				text = text + "<br />";
			}

            // replace entire table with new text
			var rng = dom.createRng();
			rng.setStartBefore(domTable);
			rng.setEndAfter(domTable);

			editor.selection.setRng(rng);
			editor.selection.setContent($('<p>' + text + '</p>').html());
			editor.nodeChanged();
		}

		// when delimiter selected we might need enable text field to use custom delimiter
		function updateDelimiter(val) {
			var altCtrl = win.find('#delimCustomValue');
			if (val === "?") {
				altCtrl.show();
			} else {
				altCtrl.hide();
			}
		}

		//
		// General settings shared between simple and advanced dialogs
		var generalFormItems = [{
			type: 'container',
			label: 'Delimiter',
			layout: 'flex',
			direction: 'row',
			align: 'left',
			spacing: 5,
			items: [{
				label: 'Symbol',
				name: 'delimiterType',
				type: 'listbox',
				text: 'Pipe',
				minWidth: 100,
				values: [
					{text: 'Pipe', value: '|'},
					{text: 'Coma', value: ','},
					{text: 'Custom', value: '?'}
				],
				onselect: function(e) {
					updateDelimiter(e.control.value());
				}
			},
			{
				name: 'delimCustomValue',
				type: 'textbox',
				maxLength: 1,
				size: 1,
				ariaLabel: 'Character:'
			}]
		}];

		// Simple default dialog
		win = editor.windowManager.open({
			title: 'Convert table to text',
			data: data,
			body: generalFormItems,
			onSubmit: onSubmitForm
		});

		win.resizeToContent();
		updateDelimiter(data.delimiterType);
	}

	editor.addButton('tableimportToTable', {
		icon: 'tableimportToTable',
		tooltip: 'Convert to table',
		onclick: showDialogToTable
	});

	editor.addButton('tableimportToText', {
		icon: 'tableimportToText',
		tooltip: 'Convert to text',
		onclick: showDialogToText,
		stateSelector: 'table'
	});

	editor.addMenuItem('tableimportToTable', {
		separator: 'before',
		icon: 'tableimportToTable',
		text: 'Convert to table',
		onclick: showDialogToTable,
		context: 'table',
		appendToContext: true
	});

	editor.addMenuItem('tableimportToText', {
		icon: 'tableimportToText',
		text: 'Convert to text',
		onclick: showDialogToText,
		context: 'table',
		apppendToContext: true
	});

	editor.addCommand('tableimportToTable', showDialogToTable);
	editor.addCommand('tableimportToText', showDialogToText);

});
