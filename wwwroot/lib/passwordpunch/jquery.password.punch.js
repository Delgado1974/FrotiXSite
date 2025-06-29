/*!
 * jQuery PasswordPunch - Validator
 * Author: @PluginPunch
 * Version: v1.0.1
 */

;(function ($) {

    var rules = {
        uppercase: /[^A-Z]/g,
        lowercase: /[^a-z]/g,
        number: /[^0-9]/g,
        special_char: /[^a-zA-Z0-9]/g,
        min_length: null
    };

    var coreSettings = {
        validationRules: {},
        oContainer: {},
        totalRules: 0
    };

    function addRule(rule, label, character_limit) {
        coreSettings.validationRules[rule] = {label: label, limit: character_limit};
        coreSettings.totalRules = coreSettings.totalRules + 1;
        if (coreSettings.oContainer) {
            coreSettings.oContainer.trigger("update-rules-list");
        }
    }

    $.fn.passwordPunch = function (options) {

        var self = this;

        var settings = $.extend({
            container: '#password_rules_container',
            listStyle: 'rule-style-default',
            completedClass: 'validated',
            rules: {},
            onValidationCompleted: function () {
            },
            onValidationError: function () {
            }
        }, options);


        if (settings.container) {
            coreSettings.oContainer = $(settings.container);
            
            coreSettings.oContainer.addClass('password-punch');
            
            coreSettings.oContainer.on("update-rules-list", function (e) {

                var ulStr = '<ul id="password-punch-list" class="' + settings.listStyle + '">';
                $.each(coreSettings.validationRules, function (rule, ruleObject) {
                    ulStr += "<li class='password-punch " + rule + "-char'>" + ruleObject.label + "</li>";
                });
                ulStr += "</ul> <div class='clearFix'></div>";

                coreSettings.oContainer.html(ulStr);
            });
        }

        $.each(settings.rules, function (rule, object) {
            addRule(rule, object.label, object.limit);
        });


        $('body').on('keyup', self, function () {
            var value = $.trim(self.val());

            if (value == '') {
                $('.password-punch').removeClass(settings.completedClass);
                return;
            }

            var totalRulesCompleted = 0;
            $.each(coreSettings.validationRules, function (rule, ruleObject) {
                var charLimit = ruleObject.limit;
                if (charLimit > 0) {
                    var regexRule = rules[rule];
                    value = value.replace(/ /g, '');
                    var totStrLen = value.length;

                    var cssClass = rule + '-char';
                    var oCharElementLi = $('.' + cssClass, coreSettings.oContainer);
                    var totalChar = 0;

                    if (rule == 'min_length') {
                        totalChar = totStrLen;
                    } else if (rule == 'special_char') {
                        var allowedCharLen = value.replace(regexRule, "").length;
                        totalChar = totStrLen - allowedCharLen;
                    } else {
                        totalChar = value.replace(regexRule, "").length;
                    }

                    if (totalChar >= charLimit) {
                        oCharElementLi.addClass(settings.completedClass);
                        totalRulesCompleted++;
                    } else {
                        oCharElementLi.removeClass(settings.completedClass);
                    }
                }
            });

            if (totalRulesCompleted >= coreSettings.totalRules) {
                if (settings.onValidationCompleted) {
                    settings.onValidationCompleted();
                }
            }
            else
            {
                if (settings.onValidationError) {
                    settings.onValidationError();
                }
            }
        });

        return {
            addRule: function (rule, label, character_limit) {
                addRule(rule, label, character_limit);
                return this;
            },
            resetRules: function () {
                coreSettings.validationRules = {};
                coreSettings.totalRules = 0;
                return this;
            }
        };
    };

}(jQuery));

