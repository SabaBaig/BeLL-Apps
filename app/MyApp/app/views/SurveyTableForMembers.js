$(function () {

    App.Views.SurveyTableForMembers = Backbone.View.extend({
        authorName: null,
        tagName: "table",
        className: "table table-striped",

        events:{

        },

        add: function (model, isSubmitted, memberId) {
            if (isSubmitted) {
                this.$el.append('<tr id="' + model._id + '"><td>' + model.SurveyNo+ '</td><td>' + model.SurveyTitle+ '</td><td><a name="' +model._id +
                    '" class="openSurvey btn btn-info" href="#openSurvey/' + model._id + '/' + isSubmitted + '/' + memberId +
                    '">Open</a><label>&nbsp&nbspSubmitted</label></td></tr>');
            } else {
                this.$el.append('<tr id="' + model._id + '"><td>' + model.SurveyNo+ '</td><td>' + model.SurveyTitle+ '</td><td><a name="' +model._id +
                    '" class="openSurvey btn btn-info" href="#openSurvey/' + model._id + '/' + isSubmitted + '/' + memberId +
                    '">Open</a><label>&nbsp&nbspUn-Submitted</label></td></tr>');
            }
        },

        render: function () {
            var that = this;
            this.$el.html('<tr><th>Survey No.</th><th>Title</th><th>Actions</th></tr>');
            var members = new App.Collections.Members()
            var member, memberId;
            members.login = $.cookie('Member.login');
            members.fetch({
                success: function () {
                    if (members.length > 0) {
                        member = members.first();
                        memberId = member.get('login') + '_' + member.get('community');
                        $.ajax({
                            url: '/survey/_design/bell/_view/surveyByreceiverIds?_include_docs=true&key="' + memberId + '"',
                            type: 'GET',
                            dataType: 'json',
                            async:false,
                            success: function(memberSurveyData) {
                                console.log(memberSurveyData);
                                var surveyDocs = [];
                                _.each(memberSurveyData.rows, function(row) {
                                    surveyDocs.push(row);
                                });
                                $.ajax({
                                    url: '/surveyresponse/_design/bell/_view/surveyResBymemberId?_include_docs=true&key="' + memberId + '"',
                                    type: 'GET',
                                    dataType: 'json',
                                    async:false,
                                    success: function(memberSurveyResData) {
                                        console.log(memberSurveyResData);
                                        var surveyResDocs = [];
                                        _.each(memberSurveyResData.rows, function(row) {
                                            if(row.value.answersToQuestions.length > 0) {
                                                surveyResDocs.push(row);
                                            }
                                        });
                                        var submitted = [];
                                        var unSubmitted = [];
                                        _.each(surveyDocs,function(row){
                                            var surveyDoc  = row.value;
                                            var index = surveyResDocs.map(function(element) {
                                                return element.value.SurveyNo;
                                            }).indexOf(surveyDoc.SurveyNo);
                                            if (index == -1) { // its a survey which is not submitted yet
                                                unSubmitted.push(surveyDoc);
                                            } else { // its an already submitted survey.
                                                submitted.push(surveyDoc);
                                            }
                                        });
                                        unSubmitted.sort(that.sortByProperty('SurveyNo'));
                                        submitted.sort(that.sortByPropertyInDecreasingOrder('SurveyNo'));
                                        var isSubmitted = false;
                                        for(var i = 0 ; i < unSubmitted.length ; i++) {
                                            var surDoc = unSubmitted[i];
                                            that.add(surDoc, isSubmitted, memberId);
                                        }
                                        for(var i = 0 ; i < submitted.length ; i++) {
                                            var surDoc = submitted[i];
                                            isSubmitted = true;
                                            that.add(surDoc, isSubmitted, memberId);
                                        }
                                    },
                                    error: function(status) {
                                        console.log(status);
                                    }
                                });
                            },
                            error: function(status) {
                                console.log(status);
                            }
                        });
                    }
                },
                async:false

            });
            applyStylingSheet();
        },

        sortByProperty: function(property) {
            'use strict';
            return function (a, b) {
                var sortStatus = 0;
                if (a[property] < b[property]) {
                    sortStatus = -1;
                } else if (a[property] > b[property]) {
                    sortStatus = 1;
                }

                return sortStatus;
            };
        },

        sortByPropertyInDecreasingOrder: function(property) {
            'use strict';
            return function (a, b) {
                var sortStatus = 0;
                if (a[property] < b[property]) {
                    sortStatus = 1;
                } else if (a[property] > b[property]) {
                    sortStatus = -1;
                }

                return sortStatus;
            };
        },

    })
})