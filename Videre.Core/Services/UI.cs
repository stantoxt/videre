﻿using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using CodeEndeavors.Extensions;
using Videre.Core.Models;

namespace Videre.Core.Services
{
    public class UI
    {
        public static string ThemeAPIUrl
        {
            get { return Portal.CurrentPortal.GetAttribute("Core", "ThemeAPIUrl", "http://api.bootswatch.com/3"); }
        }

        public static string ThemePath
        {
            get { return "~/Content/Themes/"; }
        }

        public static string LayoutPath
        {
            get { return "~/Views/Layouts/"; }
        }

        public static string LayoutContentPath
        {
            get { return "~/Content/Layouts/"; }
        }

        public static Models.Theme PortalTheme
        {
            get
            {
                return Portal.CurrentPortal != null ? GetTheme(Portal.CurrentPortal.ThemeName) : null;
            }
        }

        public static string GetDefaultLayoutPath()
        {
            //return GetLayoutPath("General");
            var layout = Portal.GetLayoutTemplates().Where(l => l.LayoutViewName.Equals("General.cshtml", StringComparison.InvariantCultureIgnoreCase)).FirstOrDefault();
            if (layout == null)
                throw new Exception("Default Layout General.cshtml not found");
            return GetLayoutPathById(layout.Id);
        }

        //public static string GetLayoutPath(string name)
        //{
        //    var layout = Portal.GetLayoutTemplate(Portal.CurrentPortalId, name);
        //    if (layout == null)
        //        throw new Exception("Layout not found: " + name);
        //    return UI.LayoutPath.PathCombine(layout.LayoutViewName).PathCombine("Layout.cshtml");
        //}

        public static string GetLayoutPathById(string id)
        {
            var layout = Portal.GetLayoutTemplateById(id);
            return UI.LayoutPath.PathCombine(layout.LayoutViewName).PathCombine("Layout.cshtml");
        }

        public static Models.Layout GetLayout(string name)
        {
            return GetLayouts().Where(t => t.Name.Equals(name, StringComparison.InvariantCultureIgnoreCase)).FirstOrDefault();
        }

        public static List<Models.Layout> GetLayouts()
        {
            var layouts = new List<Models.Layout>();
            foreach (var file in Directory.GetFiles(Portal.ResolvePath(LayoutPath), "*.manifest"))
                layouts.Add(Caching.GetFileJSONObject<Models.Layout>(file));
            return layouts;
        }

        public static Models.Theme GetTheme(string name)
        {
            return GetThemes().Where(t => t.Name.Equals(name, StringComparison.InvariantCultureIgnoreCase)).FirstOrDefault();
        }

        public static List<Models.Theme> GetThemes()
        {
            var themes = new List<Models.Theme>();
            var themeDir = Portal.ResolvePath(ThemePath);
            if (!Directory.Exists(themeDir))
                Directory.CreateDirectory(themeDir);
            foreach (var file in Directory.GetFiles(themeDir, "*.manifest"))
                themes.Add(Caching.GetFileJSONObject<Models.Theme>(file));
            return themes;
        }

        public static void InstallTheme(Models.Theme theme)
        {
            var filePath = Portal.ResolvePath(ThemePath);
            var fileName = filePath + theme.Name + ".manifest";
            if (!System.IO.File.Exists(filePath + theme.Name + ".manifest"))
            {
                theme.Thumbnail = DownloadResource(theme.Thumbnail, ThemePath.PathCombine(theme.Name));
                foreach (var file in theme.Files)
                    file.Path = DownloadResource(file.Path, ThemePath.PathCombine(theme.Name));
                theme.ToJson().WriteText(fileName);
            }
            else 
                throw new Exception(string.Format(Localization.GetLocalization(LocalizationType.Exception, "DuplicateResource.Error", "{0} already exists.   Duplicates Not Allowed.", "Core"), "Theme"));
        }

        public static void UninstallTheme(string name)
        {
            var theme = GetTheme(name);
            if (theme != null)
            {
                var themeDir = Portal.ResolvePath(ThemePath.PathCombine(theme.Name));
                if (Directory.Exists(themeDir))
                    Directory.Delete(themeDir, true);
                DeleteResource(ThemePath.PathCombine(theme.Name + ".manifest"));
            }
            else
                throw new Exception(string.Format(Localization.GetLocalization(LocalizationType.Exception, "NotFound.Error", "{0} not found.", "Core"), name));
        }

        private static bool DeleteResource(string path) //todo: need this???
        {
            var fileName = Portal.ResolvePath(path);
            if (System.IO.File.Exists(fileName))
            {
                System.IO.File.Delete(fileName);
                return true;
            }
            return false;
        }

        private static string DownloadResource(string url, string relativePath)
        {
            if (url.StartsWith("http://", StringComparison.InvariantCultureIgnoreCase))
            {
                var fileName = url.Split('/').Last();
                relativePath = relativePath.PathCombine(fileName);
                url.DownloadFile(Portal.ResolvePath(relativePath));
                return relativePath;
            }

            return url;
        }

    }
}