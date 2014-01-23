define(
    [
        'jquery',
        'backbone',
        'vkbeautify',
        'proactive/view/xml/TaskXmlView',
        'text!proactive/templates/job-template.html',
        'text!proactive/templates/workflow-view-template.html',
        'codemirror',
        'codemirrorXml'
    ],

    function ($, Backbone, beautify, TaskXmlView, JobTemplate, WorkflowTemplate, CodeMirror) {

    "use strict";

    return Backbone.View.extend({
        initialize: function () {
            var that = this;
            $('#workflow-xml-tab').on('shown', function (e) {
                that.render();
            })
        },
        xml: function (jModel) {
            var that = this;
            var job = jModel.toJSON();

            var tasks = [];
            if (jModel.tasks) {
                $.each(jModel.tasks, function (i, task) {
                    var view = new TaskXmlView({model: task, jobView: that}).render();
                    tasks.push(view.$el.text());
                });
            }

            var jobRendering = _.template(JobTemplate, {'job': job, 'tasks': tasks});

            // beautifying the job xml - removing multiple spaces
            jobRendering = jobRendering.replace(/ {2,}/g, ' ');
            // removing multiple \n before closing xml element tag
            jobRendering = jobRendering.replace(/\n+\s+>/g, '>\n');
            // indenting using vkbeautify
            return vkbeautify.xml(jobRendering.trim());
        },
        generateXml: function () {
            var that = this;
            return this.xml(this.model)
        },
        generateHtml: function () {
            var content = $("#workflow-designer").html();
            var url = document.URL;
            var hashPos = url.indexOf("#");
            if (hashPos != -1) url = url.substr(0, hashPos);
            if (url.charAt(url.length - 1) == '/') url = url.substr(0, url.length - 1);

            var width = $("#workflow-designer").get(0).scrollWidth;
            var height = $("#workflow-designer").get(0).scrollHeight;

            var html = _.template(WorkflowTemplate,
                {'url': url, 'content': content, 'width': width, 'height': height});

            // replacing all images paths
            html = html.replace(/img\//g, url + "/images/");
            return html;
        },
        render: function () {
            // indenting using vkbeautify
            this.$el.empty()
            var codeDiv = $('<div class="code" id="workflow-xml">');
            this.generatedXml = vkbeautify.xml(this.generateXml())
            this.$el.append(codeDiv);

            var highlightedXml = CodeMirror(codeDiv[0], {
                value: this.generatedXml,
                mode: 'xml',
                lineNumbers: true,
                readOnly: true
            });

            $('#xml-view-modal').on('shown.bs.modal', function (e) {
                // need to explicitly call refresh when div is shown otherwise codemirror is not visible
                highlightedXml.refresh();
            })
            return this;
        }
    })

})