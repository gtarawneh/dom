var tutorial = [
{msg: 'Hello, this tutorial will show you basic usage of dom.\r\r', delay: 3000},
{msg: 'dom is a tool for producing graphs based on natural language text. ', delay: 3000},
{msg: 'Graph nodes are declared like this ...\r\r', delay: 3000},
{msg: '[xx]', delay: 500},
{msg: '[yy]', delay: 500},
{msg: '[zz]\r\r', delay: 4000},
{msg: 'As you type in the editor the tool will automatically parse your input and update the graph in real-time.\r\r', delay: 5000},
{msg: 'Edges can be declared explicitly using the format [xx-yy]\r\r', delay: 5000},
{msg: 'Node and edge declarations can occur anywhere within text. ', delay: 3000},
{msg: 'For example [ww] and [ww-yy] [ww-zz] [yy-zz].\r\r', delay: 5000},
{msg: 'However, the tool is also able to extract edge declarations from natural language text.\r\r', delay: 5000},
{msg: 'Any sentence that contains two node names is an implicit edge declaration. ', delay: 5000},
{msg: 'For example, using the nodes [apples][trees][humans] we can write ...\r\r', delay: 2000},
{msg: 'Humans eat apples. Apples grow on trees.\r\r', delay: 3000},
{msg: 'This is the end of the tutorial. Try editing this text or starting with a new one. Graph nodes can be dragged around using the mouse if you wish to re-arrange your graphs :-)', delay: 0},
];

var tutorialOn = false;

function endTutorial() {

    tutorialOn = false;

    $("#tutorial").text('Tutorial');

    $("#writingarea").focus();

    $("#writingarea").attr("disabled", false);

}

function tutorialButtonPressed() {

    if (!tutorialOn) {

        tutorialOn = true;

        $("#tutorial").text('Tutorial (in progress, refresh to exit ...)');

        $("#writingarea").focus();

        $("#writingarea").attr("disabled", true);

        $("#writingarea").val('');

        goTutorialStage(0);

    }

}

function goTutorialStage(stage) {

    printSentence(tutorial[stage].msg , function() {

        setTimeout(function() {

            if (stage+1 < tutorial.length) {

                goTutorialStage(stage+1);

            } else {

                endTutorial();

            }

        }, tutorial[stage].delay);

    });

}

function printSentence(str, onfinish) {

    var i = 0;

    var oldText = $('#writingarea').val();

    var int1 = setInterval(function() {

        if (!tutorialOn) {

            clearInterval(int1);

            return;

        }

        $('#writingarea').val(oldText + str.substring(0, i++));

        onTextChange();

        if (i>str.length) {

            clearInterval(int1);

            onfinish();

        }

    }, 25);

}
