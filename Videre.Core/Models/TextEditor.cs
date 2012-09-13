﻿
namespace Videre.Core.Models
{
    public class TextEditor : IClientControl
    {
        private string _path = null;

        public TextEditor(string dataColumn, string path)
        {
            DataColumn = dataColumn;
            _path = path;
        }

        public string Path { get { return _path; } }
        public string DataColumn { get; set; }
        public bool Required { get; set; }
        public string LabelText { get; set; }
        public string ClientId { get; set; }    //must be assigned every time the widget is rendered

        public string ScriptPath
        {
            get
            {
                return string.Format("~/scripts/Controls/{0}/", Path);
            }
        }

        public string GetId(string Id)
        {
            return string.Format("{0}_{1}", this.ClientId, Id);
        }

        public string GetText(string key, string defaultValue)
        {
            return Services.Localization.GetLocalization(LocalizationType.ClientControl, key, defaultValue, this.Path);
        }

        public string GetPortalText(string key, string defaultValue)
        {
            return Services.Localization.GetPortalText(key, defaultValue);
        }

    }

}