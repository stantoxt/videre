﻿videre.registerNamespace('videre.widgets');
videre.registerNamespace('videre.widgets.editor');

videre.widgets.editor.texthtml = videre.widgets.editor.base.extend(
{
    //constructor
    init: function()
    {
        this._base();  //call base method
        //this._editor = null;
        this._sharedContent = null;
        this._sharedContentDict = null;
        this._linkCountDict = null;
        this._newShareDialog = null;
        this._newContent = null;

        this._delegates = {
            onDataReceived: videre.createDelegate(this, this._onDataReceived),
            onShareDeleted: videre.createDelegate(this, this._onShareDeleted)
        };
    },

    _onLoad: function(src, args)
    {
        this._base(); //call base
        //this._editor = videre.widgets.find(this.getId('txtHtml'));
        this._newShareDialog = this.getControl('NewShareDialog').modal('hide');
        this.getControl('ddlLink').change(videre.createDelegate(this, this._onLinkChanged));
        this.getControl('btnNewShare').click(videre.createDelegate(this, this._onNewShareClicked));
        this.getControl('btnDeleteShare').click(videre.createDelegate(this, this._onDeleteShareClicked));
        this.getControl('btnOkNewShare').click(videre.createDelegate(this, this._onNewShareOkClicked));

    },

    show: function(widget, manifest, contentAdmin)
    {
        this._base(widget, manifest, contentAdmin);
        this._newContent = { Id: '', Key: 'Content.Text', Namespace: '', Text: '', EditText: '', Locale: '', EffectiveDate: null, ExpirationDate: null };
        if (widget.Content == null)
            widget.Content = [];
        if (widget.Content.length == 0)
            widget.Content[0] = this._newContent;

        this._widget.find('.nav-tabs a:first').tab('show');
        if (this._sharedContent == null)
            this.getSharedContent();
        else
            this.bind();
    },

    deleteShare: function(name)
    {
        //if (this._sharedContentDict[name] != null && confirm('Are you sure you wish to delete this share?'))    //todo: localize
        var self = this;
        videre.UI.confirm('Delete Entry', 'Are you sure you wish to remove this entry?', function ()
        {
            self.ajax('~/core/localization/delete', { id: self._sharedContentDict[name].Id }, self._delegates.onShareDeleted, null, null, self._sharedContentDict[name]);
        });
    },

    showNewShareDialog: function()
    {
        //this._newShareDialog.modal('show');
        //this.getControl('txtNewShare').val('').focus();
        var self = this;
        videre.UI.prompt(this.getId('NewMenu'), 'New Share', '', [{ label: 'Name', dataColumn: 'NewName' }],
            [{
                text: 'Ok', css: 'btn-primary', close: true, handler: function (data)
                {
                    if (!String.isNullOrEmpty(data.NewName))
                    {
                        var name = data.NewName;
                        if (self._sharedContentDict[name] == null)
                        {
                            var content = self._newContent;
                            content.Namespace = name;
                            self._widgetData.Content[0] = content;
                            self._sharedContent.push(content);
                            self._sharedContentDict[name] = content;
                            self.bindLinks();
                            self.getControl('ddlLink').val(name);

                            self._handleShareChanged(name);
                            self._newShareDialog.modal('hide');
                        }
                        else
                            alert('Share name must be unique!');    //todo: localize
                        return true;
                    }
                }
            }, { text: 'Cancel', css: 'btn-default', close: true }]);

    },

    bind: function()
    {
        var content = this._widgetData.Content[0];

        if (content.Namespace != null && content.Namespace.indexOf('__') == 0)  //non-shared content has namespace of __widgetId - don't show user this as its ugly.  It will get re-applied on server
            content.Namespace = '';

        this.findControl('.videre-tabs').toggle(this._contentAdmin);
        this.findControl('.tab-pane').removeClass('active');
        if (this._contentAdmin)
        {
            this.getControl('ddlLink').val(this._sharedContentDict[content.Namespace] != null ? this._widgetData.Content[0].Namespace : '');
            this.getControl('lblLinkCount').html(String.format("({0})", this._linkCountDict[content.Id] != null ? this._linkCountDict[content.Id].length : '0'));
            this.bindData(content, this.getControl('GeneralTab'));
            this.getControl('WidgetTab').addClass('active');
        }
        else
        {
            this.getControl('MarkupTab').addClass('active');
        }

        this.bindData(content, this.getControl('ContentProperties'));
        
        //this._editor.bind(content);
    },

    bindLinks: function()
    {
        var ddl = this.getControl('ddlLink');
        ddl[0].options.length = 0;
        ddl.append($('<option></option>').val('').html(''));
        $.each(this._sharedContent, function(val, text)
        {
            ddl.append($('<option></option>').val(this.Namespace).html(this.Namespace));
        });

    },

    validate: function()
    {
        //add custom validation here
        return this._base();
    },

    save: function()
    {
        //persist before calling base
        if (this._contentAdmin)
            this.persistData(this._widgetData.Content[0], false, this.getControl('GeneralTab'));

        this.persistData(this._widgetData.Content[0], false, this.getControl('ContentProperties'));
        //this._editor.persist();
        this._base();
    },

    getSharedContent: function()
    {
        this.ajax('~/core/localization/GetSharedWidgetContent', {}, this._delegates.onDataReceived);
    },

    showImport: function()
    {
        this._shareDialog.modal('show');
    },

    _handleShareChanged: function(id)
    {
        if (this._sharedContentDict[id] != null)
            this._widgetData.Content[0] = this._sharedContentDict[id];
        else
            this._widgetData.Content[0] = this._newContent;

        this.bind();
    },

    //_handleNewShare: function()
    //{
    //    var name = this.getControl('txtNewShare').val();
    //    if (!String.isNullOrEmpty(name))    //todo: verify not exist in _menuData as well
    //    {
    //        if (this._sharedContentDict[name] == null)
    //        {
    //            var content = this._newContent;
    //            content.Namespace = name;
    //            this._widgetData.Content[0] = content;
    //            this._sharedContent.push(content);
    //            this._sharedContentDict[name] = content;
    //            this.bindLinks();
    //            this.getControl('ddlLink').val(name);

    //            this._handleShareChanged(name);
    //            this._newShareDialog.modal('hide');
    //        }
    //        else
    //            alert('Share name must be unique!');    //todo: localize
    //    }
    //},

    _handleDeleteShare: function(id)
    {
        if (!String.isNullOrEmpty(this._sharedContentDict[id].Id))  //if its saved already
            this.deleteShare(id);
        else   //wss just on client (never saved)
            this._removeShare(id);
    },

    _removeShare: function(name)
    {
        if (this._sharedContentDict[name] != null)
        {
            this._sharedContent = this._sharedContent.where(function(d) { return d.Namespace != name; });
            this._sharedContentDict = this._sharedContent.toDictionary(function(d) { return d.Namespace; });
            this.bindLinks();
            this.getControl('ddlLink').val('');
            this._handleShareChanged('');
        }
    },

    _onShareDeleted: function(result, ctx)
    {
        if (!result.HasError && result.Data)
            this._removeShare(ctx.Namespace);
    },

    _onDataReceived: function(result)
    {
        if (!result.HasError && result.Data)
        {
            this._sharedContent = result.Data.localizations;
            this._linkCountDict = result.Data.idCounts; //already a dictionary (id, count)
            this._sharedContentDict = this._sharedContent.toDictionary(function(d) { return d.Namespace; });

            if (this._sharedContentDict[this._widgetData.Content[0].Namespace] == null) //if not shared content, we re-use whenever we create a new!
                this._newContent = this._widgetData.Content[0];

            //this.showImport();
            this.bindLinks();
            this.bind();
        }
    },

    _onNewShareClicked: function(e)
    {
        this.showNewShareDialog();
    },

    _onDeleteShareClicked: function(e)
    {
        this._handleDeleteShare(this.getControl('ddlLink').val());
    },

    _onNewShareOkClicked: function(e)
    {
        this._handleNewShare();
    },

    _onLinkChanged: function(e)
    {
        this._handleShareChanged(this.getControl('ddlLink').val());
    }

});

