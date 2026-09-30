(function () {

    "use strict";

    /* =========================================================
       HAPROVEN CORE LOADER
       Base64 encoded paths
       https://codersusheel.github.io/haprobase/
    ========================================================= */

    const decode = function (value) {
        return atob(value);
    };

    const files = [

        // api/global.js
        "aHR0cHM6Ly9jb2RlcnN1c2hlZWwuZ2l0aHViLmlvL2hhcHJvYmFzZS9leHRlcm5hbC9qcy9hcGkvZ2xvYmFsLmpz",

        // auth/auth.js
        "aHR0cHM6Ly9jb2RlcnN1c2hlZWwuZ2l0aHViLmlvL2hhcHJvYmFzZS9leHRlcm5hbC9qcy9hdXRoL2F1dGguanM=",

        // main/script.js
        "aHR0cHM6Ly9jb2RlcnN1c2hlZWwuZ2l0aHViLmlvL2hhcHJvYmFzZS9leHRlcm5hbC9qcy9tYWluL3NjcmlwdC5qcw==",

        // main/page-loader.js
        "aHR0cHM6Ly9jb2RlcnN1c2hlZWwuZ2l0aHViLmlvL2hhcHJvYmFzZS9leHRlcm5hbC9qcy9tYWluL3BhZ2UtbG9hZGVyLmpz",

        // security/anti-inspect.js
        // "aHR0cHM6Ly9jb2RlcnN1c2hlZWwuZ2l0aHViLmlvL2hhcHJvYmFzZS9leHRlcm5hbC9qcy9zZWN1cml0eS9hbnRpLWluc3BlY3QuanM=",

        // security/protect.js
        // "aHR0cHM6Ly9jb2RlcnN1c2hlZWwuZ2l0aHViLmlvL2hhcHJvYmFzZS9leHRlcm5hbC9qcy9zZWN1cml0eS9wcm90ZWN0Lmpz"z







    ];

    files.forEach(function (encoded) {

        const src = decode(encoded);

        document.write(
            '<script src="' + src + '"><\/script>'
        );

    });

})();


