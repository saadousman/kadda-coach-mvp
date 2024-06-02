function sharePage() {
    if (navigator.share) {
        navigator.share({
            title: 'Kadda Coach',
            text: 'Check out the Kadda Coach app!',
            url: window.location.href
        }).then(() => {
            console.log('Successfully shared');
        }).catch((error) => {
            console.error('Something went wrong sharing the page', error);
        });
    } else {
        alert('Your browser does not support the Web Share API');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('Kadda Coach app loaded');
});
