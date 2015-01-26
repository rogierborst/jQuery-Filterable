# jQuery-Filterable
Make a table filterable with this jQuery plugin.


## Installation
Simply include jQuery and `filterable.js` in your HTML page.

##Usage
In JavaScript, enabling the filtering plugin can be as simple as this:
```javascript
$('#my-table').filterable();
```
In order for this to function, your html requires a bit of setup. First of all, a form with checkboxes that your user can uncheck to hide certain rows...
```html
<form id="filter-controls">
  <label>
    <input type="checkbox" value="blizzard" data-filter-column="1" checked /> Blizzard
  </label>
  <label>
    <input type="checkbox" value="ubisoft" data-filter-column="1" checked /> Ubisoft
  </label>
  <!-- optionally you can use a text / search input to filter the table on user entered text -->
  <label>
    <input type="search" placeholder="search" id="search-controls"> Search the table
</form>
```
Beyond that, obviously you should have a table containing data...
```html
<table id="my-table" data-filter-controls="#filter-controls" data-search-controls="#search-controls">
  <tr>
    <td>World of Warcraft</td>
    <td>Blizzard</td>
    <td>mmorpg</td>
  </tr>
  <tr>
    <td>Assassin's Creed</td>
    <td>Ubisoft</td>
    <td>action</td>
  </tr>
</table>
```
Pay attention to the following details:
* The table points to its filter controls using the `data-filter-controls="#filter-controls"` attribute. Its value should be a valid jQuery selector (in this case an id-selector), pointing to the container of the filter checkboxes.
* In a similar fashion, the table is responsible for pointing to its search box using the `data-search-controls` attribute. Its value should be a valid jQuery selector, pointing directly to the input field (so not its container or anything higher up the DOM tree).
* Each checkbox has a `data-filter-column` attribute, telling the plugin what column that checkbox is for. It is zero-based, meaning the first column is 0. In this case, we set it to 1, telling the plugin it should look for the values 'blizzard' and 'ubisoft' in the *second* column of the table.
* The value of the checkboxes is what will be used for filtering, *not* the label text. Also, by default filtering is case *in*sensitive, so even though the value of that checkbox is 'ubisoft`, it *will* match the value 'Ubisoft' (note the capital U) in the second column of the second row.

Now, unchecking the Blizzard checkbox will hide the first row. Re-checking it will make the row visible again.

---

You can change the default behaviour by passing an options object. For example:
```javascript
$('#my-table').filterable({
  caseSensitiveFilter: true,
  emptyTableMessage: 'No games found matching your current filtering criteria.'
});
```
which tell the plugin that the values of your checkboxes and the text inside your cells should be exact matches (case sensitive), and that if all rows have been hidden, a message should be displayed inside the table.

## Options
The following options can be used to setup jQuery Filterable:

Option | Description | Default
-------|-------------|--------
**caseSensitiveFilter** *(boolean)* | Set to true if you need checkbox values to match cell text with case sensitivity. | *false*
**caseSensitiveSearch** *(boolean)* | Set to true if you want case sensitive filtering when using the search box. | *false*
**emptyTableMessage** *(string)* | When all table rows are hidden due to the current filter / search settings, the plugin can add a row to the table with one cell spanning the entire row and containing the message you set here. If left blank, the row will never be added. The string may contain html tags, which will not be stripped, allowing you to further customize the message. | *''*
**emptyTableMessageClass** *(string)* | Here you can add a class to the row containing your `emptyTableMessage`. | 'empty-table-message'
**evenRowClass** *(string)* | In order to maintain zebra-striping for your tables, you can define a class that will be added to every even, visible row after filtering. | *''*
**oddRowClass** *(string)* | Likewise, if you wish to add a class to every odd, visible row after filtering, you can set it here. Although you could set both *evenRowClass* **and** *oddRowClass*, it usually makes more sense to use only one of these and let default table styling take care of the other rows. | ''
**tickCheckboxesAtStart** *(boolean)* | If you're not sure that all checkboxes will be checked on page load, but you'd like them to be, you can set this to `true`. In that case, the plugin will check all checkboxes in the filter controls container before initializing the filtering capabilities. | *false*
**clearSearchBoxAtStart** *(boolean)* | Likewise, if you're not sure the search input field will be empty on page load, you can set this to `true` to have the plugin clear it for you. | *false*

## Array Columns
Sometimes a single cell might contain multiple values that you want to be able to filter on individually. Consider the following table:

Title | Company | Genre
------|---------|------
Assassin`s Creed | Ubisoft | *action, rpg*
GTA V | Rockstar | *action, fps*
World of Warcraft | Blizzard | *rpg*

In this case the 'Genre' column contains a combination of terms that your user may want to filter on.

### Inclusive filtering on array columns

Let's say the user unchecks 'rpg'. The plugin hides the last row (containing `World of Warcraft`) as expected, because its genre *only* contains 'rpg'.

But what happens when the user now unchecks 'action' as well? Well, by default nothing will happen. The plugin is looking for cells that contain the exact phrase 'action'. No such cells exist, since all cells that contain 'action' also contain extra text (i.e. ', fps' and ', rpg').

What we want to happen, is the first row to be hidden too. It contains both unchecked filter terms, separated by a comma. It doesn't contain any extra terms that are currently still checked. It should be hidden. How do we make that happen?

Configuring this kind of behavior is done through the `arrayColumns` object that you can add to your options. For the example above, this is how you'd set things up to get the expected behavior:
```javascript
$('#my-table').filterable({
  arrayColumns: {
    2: {
      separator: ', '
    }
  }
});
```
Here we pass an object to the `arrayColumns` object. The name of this object (`2`) refers to the column index. It is zero-based, so since we want the third column to be treated as an array column, we give it the name `2`.

Inside that object we set the separator to be a comma followed by a space, since that is how the individual values are separated inside the cells. And voilá, now things are working fine!

### Exclusive filtering on array columns
In the previous example, when unchecking 'rpg' only, we expected only the last row to be hidden. The first row also contained the term 'rpg', but we expected it to remain visible, since it also contained the term 'action', which was left checked in the filter controls.

But what if we want to also hide the first row in this case? The fact that it contains the term 'rpg' is enough reason to hide it, we don't care that 'action' still matches a checked filter box?

In that case we're doing 'exclusive' filtering. The moment one term matches an unchecked checkbox, we hide the row. This is done by adding the following key value pair to your arrayColumns options object:
```javascript
$('#my-table').filterable({
  arrayColumns: {
    2: {
      separator: ', ',
      exclusive: true // setup the third column for exclusive array filtering
    }
  }
});
```

