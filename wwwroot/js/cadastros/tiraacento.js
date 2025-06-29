function TiraAcento(input) {
    var accentMap = {
        'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u',
        'à': 'a', 'è': 'e', 'ì': 'i', 'ò': 'o', 'ù': 'u',
        'â': 'a', 'ê': 'e', 'î': 'i', 'ô': 'o', 'û': 'u',
        'ã': 'a', 'õ': 'o',
        'ç': 'c',
        'Á': 'A', 'É': 'E', 'Í': 'I', 'Ó': 'O', 'Ú': 'U',
        'À': 'A', 'È': 'E', 'Ì': 'I', 'Ò': 'O', 'Ù': 'U',
        'Â': 'A', 'Ê': 'E', 'Î': 'I', 'Ô': 'O', 'Û': 'U',
        'Ã': 'A', 'Õ': 'O',
        'Ç': 'C'
    };

    var result = '';

    for (var i = 0; i < input.length; i++) {
        var char = input.charAt(i);
        result += accentMap[char] || char;
    }

    // Replace spaces with underscores
    result = result.replace(/\s/g, '_');

    debugger;

    return result.toUpperCase();
}
