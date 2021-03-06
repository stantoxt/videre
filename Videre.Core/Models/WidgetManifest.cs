﻿using System.Collections.Generic;
using CodeEndeavors.Extensions;

namespace Videre.Core.Models
{
    public class WidgetManifest : IManifest //: CodeEndeavors.ResourceManager.IId
    {
        private ContentProviders.IWidgetContentProvider _contentProvider = null;

        public WidgetManifest()
        {
            //Properties = new Dictionary<string, string>();  
            AttributeDefinitions = new List<AttributeDefinition>();
        }

        public string Id { get; set; }
        public string Path { get; set; }
        public string Name { get; set; }
        public string Title { get; set; }
        public string Category { get; set; }
        public string ContentProvider { get; set; }
        public string EditorType { get; set; }
        public string EditorPath { get; set; }

        public string FullName
        {
            get
            {
                return Path.PathCombine(Name);
            }
        }

        public ContentProviders.IWidgetContentProvider GetContentProvider()
        {
            if (_contentProvider == null && !string.IsNullOrEmpty(ContentProvider))
                _contentProvider = ContentProvider.GetInstance<ContentProviders.IWidgetContentProvider>();
            return _contentProvider;
        }

        //public Dictionary<string, string> Properties {get;set;} //Widget Settings Property Names
        public List<AttributeDefinition> AttributeDefinitions { get; set; } 

    }

}
